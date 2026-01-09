import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getMember } from "@/features/workspaces/members/utils";
import { DATABASE_ID, MEMBERS_ID, TASKS_ID, CHECKLIST_ITEMS_ID, CHECKLIST_ITEM_ASSIGNEES_ID, TASK_ASSIGNEES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { Task, TaskStatus, WorkspaceMember } from "../types";
import type { ChecklistItem, ChecklistItemAssignee } from "@/features/checklist/types";
import {
    getChecklistItemsSchema,
    createChecklistItemSchema,
    updateChecklistItemSchema,
    bulkUpdateChecklistItemsSchema,
    convertToTaskSchema,
    addChecklistAssigneeSchema,
    bulkAssignChecklistSchema,
    deleteChecklistSchema,
} from "@/features/checklist/schemas";
import { createActivityLog } from "../utils/create-activity-log";
import { ActivityAction } from "../types/activity-log";

const app = new Hono()

    // Get checklist items by task
    .get(
        '/',
        sessionMiddleware,
        zValidator('query', getChecklistItemsSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { taskId } = ctx.req.valid('query');

            // Get task to verify workspace access
            const task = await databases.getDocument(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Get checklist items ordered by position
            const items = await databases.listDocuments<ChecklistItem>(
                DATABASE_ID,
                CHECKLIST_ITEMS_ID,
                [
                    Query.equal('taskId', taskId),
                    Query.orderAsc('position'),
                    Query.limit(100)
                ]
            );

            // Get all assignees for these items
            const itemIds = items.documents.map(item => item.$id);
            const assigneesMap: Record<string, { workspaceMemberId: string; name?: string }[]> = {};

            if (itemIds.length > 0) {
                const assignees = await databases.listDocuments<ChecklistItemAssignee>(
                    DATABASE_ID,
                    CHECKLIST_ITEM_ASSIGNEES_ID,
                    [
                        Query.contains('itemId', itemIds),
                        Query.limit(500)
                    ]
                );

                // Get member details
                const memberIds = [...new Set(assignees.documents.map(a => a.workspaceMemberId))];
                const members = memberIds.length > 0
                    ? await databases.listDocuments<WorkspaceMember>(
                        DATABASE_ID,
                        MEMBERS_ID,
                        [Query.contains('$id', memberIds)]
                    )
                    : { documents: [] };

                const membersById = Object.fromEntries(
                    members.documents.map(m => [m.$id, m])
                );

                // Group assignees by item
                for (const assignee of assignees.documents) {
                    if (!assigneesMap[assignee.itemId]) {
                        assigneesMap[assignee.itemId] = [];
                    }
                    assigneesMap[assignee.itemId].push({
                        workspaceMemberId: assignee.workspaceMemberId,
                        name: membersById[assignee.workspaceMemberId]?.name
                    });
                }
            }

            // Populate items with assignees
            const populatedItems = items.documents.map(item => ({
                ...item,
                assignees: assigneesMap[item.$id] || []
            }));

            return ctx.json({
                data: {
                    documents: populatedItems,
                    total: items.total
                }
            });
        }
    )

    // Create checklist item
    .post(
        '/',
        sessionMiddleware,
        zValidator('json', createChecklistItemSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { taskId, workspaceId, title, dueDate, position, checklistTitle } = ctx.req.valid('json');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Calculate position if not provided
            let finalPosition = position;
            if (finalPosition === undefined) {
                const lastItem = await databases.listDocuments<ChecklistItem>(
                    DATABASE_ID,
                    CHECKLIST_ITEMS_ID,
                    [
                        Query.equal('taskId', taskId),
                        Query.orderDesc('position'),
                        Query.limit(1)
                    ]
                );
                finalPosition = lastItem.documents.length > 0
                    ? lastItem.documents[0].position + 1024
                    : 1024;
            }

            const item = await databases.createDocument(
                DATABASE_ID,
                CHECKLIST_ITEMS_ID,
                ID.unique(),
                {
                    taskId,
                    workspaceId,
                    title,
                    completed: false,
                    dueDate: dueDate ? dueDate.toISOString() : null,
                    position: finalPosition,
                    createdBy: member.$id,
                }
            );

            // Update task checklist counters and title (on first item)
            const task = await databases.getDocument(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            const updateData: Record<string, unknown> = {
                checklistCount: (task.checklistCount || 0) + 1,
            };

            // Set checklist title only if it's the first item and title is provided
            if (checklistTitle && !task.checklistTitle) {
                updateData.checklistTitle = checklistTitle;
            }

            await databases.updateDocument(
                DATABASE_ID,
                TASKS_ID,
                taskId,
                updateData
            );

            // Create activity log for checklist item creation
            createActivityLog({
                databases,
                taskId,
                actorMemberId: member.$id,
                action: ActivityAction.CHECKLIST_UPDATED,
                payload: {
                    subAction: 'item_added',
                    itemTitle: title,
                } satisfies import('../types/activity-log').ChecklistUpdatedPayload,
            });

            return ctx.json({ data: { ...item, assignees: [] } });
        }
    )

    // Update checklist item
    .patch(
        '/:itemId',
        sessionMiddleware,
        zValidator('json', updateChecklistItemSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const itemId = ctx.req.param('itemId');

            const updates = ctx.req.valid('json');

            // Get item to verify workspace access
            const item = await databases.getDocument<ChecklistItem>(
                DATABASE_ID,
                CHECKLIST_ITEMS_ID,
                itemId
            );

            const member = await getMember({
                databases,
                workspaceId: item.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            const updateData: Record<string, unknown> = {
                updatedBy: member.$id
            };

            if (updates.title !== undefined) updateData.title = updates.title;
            if (updates.completed !== undefined) updateData.completed = updates.completed;
            if (updates.dueDate !== undefined) {
                updateData.dueDate = updates.dueDate ? updates.dueDate.toISOString() : null;
            }
            if (updates.position !== undefined) updateData.position = updates.position;

            const updatedItem = await databases.updateDocument(
                DATABASE_ID,
                CHECKLIST_ITEMS_ID,
                itemId,
                updateData
            );

            // Update task completed counter if completed status changed
            if (updates.completed !== undefined && updates.completed !== item.completed) {
                const task = await databases.getDocument(
                    DATABASE_ID,
                    TASKS_ID,
                    item.taskId
                );
                const delta = updates.completed ? 1 : -1;
                await databases.updateDocument(
                    DATABASE_ID,
                    TASKS_ID,
                    item.taskId,
                    {
                        checklistCompletedCount: Math.max(0, (task.checklistCompletedCount || 0) + delta),
                    }
                );

                // Create activity log for checklist item completion toggle
                createActivityLog({
                    databases,
                    taskId: item.taskId,
                    actorMemberId: member.$id,
                    action: ActivityAction.CHECKLIST_UPDATED,
                    payload: {
                        subAction: updates.completed ? 'item_completed' : 'item_uncompleted',
                        itemTitle: updatedItem.title,
                    } satisfies import('../types/activity-log').ChecklistUpdatedPayload,
                });
            }

            return ctx.json({ data: updatedItem });
        }
    )

    // Bulk update checklist items (for reordering and/or toggling completion)
    .patch(
        '/bulk-update',
        sessionMiddleware,
        zValidator('json', bulkUpdateChecklistItemsSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { taskId, items } = ctx.req.valid('json');

            // Get task to verify workspace access
            const task = await databases.getDocument(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Get current state of items to calculate delta for completed count
            const itemIds = items.map(i => i.$id);
            const currentItems = await databases.listDocuments<ChecklistItem>(
                DATABASE_ID,
                CHECKLIST_ITEMS_ID,
                [Query.contains('$id', itemIds)]
            );

            const currentItemsMap = Object.fromEntries(
                currentItems.documents.map(item => [item.$id, item])
            );

            let completedDelta = 0;

            // Update all items
            const updatedItems = await Promise.all(
                items.map(async (item) => {
                    const currentItem = currentItemsMap[item.$id];
                    const updateData: Record<string, unknown> = { updatedBy: member.$id };

                    if (item.position !== undefined) updateData.position = item.position;

                    if (item.completed !== undefined) {
                        updateData.completed = item.completed;
                        // Calculate delta for completed count
                        if (currentItem && currentItem.completed !== item.completed) {
                            completedDelta += item.completed ? 1 : -1;
                        }
                    }

                    return databases.updateDocument(
                        DATABASE_ID,
                        CHECKLIST_ITEMS_ID,
                        item.$id,
                        updateData
                    );
                })
            );

            // Update task completed counter if needed
            if (completedDelta !== 0) {
                await databases.updateDocument(
                    DATABASE_ID,
                    TASKS_ID,
                    taskId,
                    {
                        checklistCompletedCount: Math.max(0, (task.checklistCompletedCount || 0) + completedDelta),
                    }
                );
            }

            return ctx.json({ data: updatedItems });
        }
    )

    // Delete checklist item
    .delete(
        '/item/:itemId',
        sessionMiddleware,
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const itemId = ctx.req.param('itemId');

            // Get item to verify workspace access
            const item = await databases.getDocument<ChecklistItem>(
                DATABASE_ID,
                CHECKLIST_ITEMS_ID,
                itemId
            );

            const member = await getMember({
                databases,
                workspaceId: item.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Delete all assignees first
            const assignees = await databases.listDocuments(
                DATABASE_ID,
                CHECKLIST_ITEM_ASSIGNEES_ID,
                [Query.equal('itemId', itemId)]
            );

            for (const assignee of assignees.documents) {
                await databases.deleteDocument(
                    DATABASE_ID,
                    CHECKLIST_ITEM_ASSIGNEES_ID,
                    assignee.$id
                );
            }

            // Delete the item
            await databases.deleteDocument(
                DATABASE_ID,
                CHECKLIST_ITEMS_ID,
                itemId
            );

            // Update task checklist counters
            const task = await databases.getDocument(
                DATABASE_ID,
                TASKS_ID,
                item.taskId
            );
            await databases.updateDocument(
                DATABASE_ID,
                TASKS_ID,
                item.taskId,
                {
                    checklistCount: Math.max(0, (task.checklistCount || 0) - 1),
                    checklistCompletedCount: item.completed
                        ? Math.max(0, (task.checklistCompletedCount || 0) - 1)
                        : task.checklistCompletedCount || 0,
                }
            );

            // Create activity log for checklist item deletion
            createActivityLog({
                databases,
                taskId: item.taskId,
                actorMemberId: member.$id,
                action: ActivityAction.CHECKLIST_UPDATED,
                payload: {
                    subAction: 'item_removed',
                    itemTitle: item.title,
                } satisfies import('../types/activity-log').ChecklistUpdatedPayload,
            });

            return ctx.json({ data: { $id: itemId } });
        }
    )

    // Convert checklist item to task
    .post(
        '/convert-to-task',
        sessionMiddleware,
        zValidator('json', convertToTaskSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { itemId, workspaceId } = ctx.req.valid('json');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Get the checklist item
            const item = await databases.getDocument<ChecklistItem>(
                DATABASE_ID,
                CHECKLIST_ITEMS_ID,
                itemId
            );

            // Get highest position in workspace
            const lastTask = await databases.listDocuments<Task>(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal('workspaceId', workspaceId),
                    Query.orderDesc('position'),
                    Query.limit(1)
                ]
            );

            const newPosition = lastTask.documents.length > 0
                ? lastTask.documents[0].position + 1024
                : 1024;

            // Create new task from checklist item
            const newTask = await databases.createDocument(
                DATABASE_ID,
                TASKS_ID,
                ID.unique(),
                {
                    name: item.title,
                    status: TaskStatus.BACKLOG,
                    workspaceId,
                    position: newPosition,
                    dueDate: item.dueDate,
                    priority: 3,
                    createdBy: member.$id,
                }
            );

            // Migrate assignees from checklist item to new task
            const checklistAssignees = await databases.listDocuments<ChecklistItemAssignee>(
                DATABASE_ID,
                CHECKLIST_ITEM_ASSIGNEES_ID,
                [Query.equal('itemId', itemId)]
            );

            // Create task assignees and delete checklist item assignees
            for (const assignee of checklistAssignees.documents) {
                // Create task assignee
                await databases.createDocument(
                    DATABASE_ID,
                    TASK_ASSIGNEES_ID,
                    ID.unique(),
                    {
                        taskId: newTask.$id,
                        workspaceMemberId: assignee.workspaceMemberId
                    }
                );

                // Delete checklist item assignee
                await databases.deleteDocument(
                    DATABASE_ID,
                    CHECKLIST_ITEM_ASSIGNEES_ID,
                    assignee.$id
                );
            }

            // Delete the checklist item (it's now a task)
            await databases.deleteDocument(
                DATABASE_ID,
                CHECKLIST_ITEMS_ID,
                itemId
            );

            // Update parent task checklist counters
            const parentTask = await databases.getDocument(
                DATABASE_ID,
                TASKS_ID,
                item.taskId
            );

            await databases.updateDocument(
                DATABASE_ID,
                TASKS_ID,
                item.taskId,
                {
                    checklistCount: Math.max(0, (parentTask.checklistCount || 0) - 1),
                    checklistCompletedCount: item.completed
                        ? Math.max(0, (parentTask.checklistCompletedCount || 0) - 1)
                        : parentTask.checklistCompletedCount || 0,
                }
            );

            return ctx.json({ data: newTask });
        }
    )

    // ===== CHECKLIST ASSIGNEES ENDPOINTS =====

    // Add assignee to checklist item
    .post(
        '/assignees',
        sessionMiddleware,
        zValidator('json', addChecklistAssigneeSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { itemId, workspaceId, workspaceMemberId } = ctx.req.valid('json');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Check if already assigned
            const existing = await databases.listDocuments(
                DATABASE_ID,
                CHECKLIST_ITEM_ASSIGNEES_ID,
                [
                    Query.equal('itemId', itemId),
                    Query.equal('workspaceMemberId', workspaceMemberId),
                    Query.limit(1)
                ]
            );

            if (existing.documents.length > 0) {
                return ctx.json({ error: 'Already assigned' }, 400);
            }

            const assignee = await databases.createDocument(
                DATABASE_ID,
                CHECKLIST_ITEM_ASSIGNEES_ID,
                ID.unique(),
                {
                    itemId,
                    workspaceId,
                    workspaceMemberId,
                    createdBy: member.$id
                }
            );

            return ctx.json({ data: assignee });
        }
    )

    // Remove assignee from checklist item
    .delete(
        '/assignees/:itemId/:workspaceMemberId',
        sessionMiddleware,
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const itemId = ctx.req.param('itemId');
            const workspaceMemberId = ctx.req.param('workspaceMemberId');

            // Get item to verify workspace access
            const item = await databases.getDocument<ChecklistItem>(
                DATABASE_ID,
                CHECKLIST_ITEMS_ID,
                itemId
            );

            const member = await getMember({
                databases,
                workspaceId: item.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Find the assignee record
            const assignees = await databases.listDocuments(
                DATABASE_ID,
                CHECKLIST_ITEM_ASSIGNEES_ID,
                [
                    Query.equal('itemId', itemId),
                    Query.equal('workspaceMemberId', workspaceMemberId),
                    Query.limit(1)
                ]
            );

            if (assignees.documents.length === 0) {
                return ctx.json({ error: 'Assignee not found' }, 404);
            }

            await databases.deleteDocument(
                DATABASE_ID,
                CHECKLIST_ITEM_ASSIGNEES_ID,
                assignees.documents[0].$id
            );

            return ctx.json({ data: { itemId, workspaceMemberId } });
        }
    )

    // Bulk assign members to checklist item
    .post(
        '/assignees/bulk',
        sessionMiddleware,
        zValidator('json', bulkAssignChecklistSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { itemId, workspaceId, workspaceMemberIds } = ctx.req.valid('json');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Get existing assignees
            const existing = await databases.listDocuments<ChecklistItemAssignee>(
                DATABASE_ID,
                CHECKLIST_ITEM_ASSIGNEES_ID,
                [Query.equal('itemId', itemId)]
            );

            const existingMemberIds = new Set(existing.documents.map(a => a.workspaceMemberId));

            // Create new assignees (skip existing)
            const newAssignees = await Promise.all(
                workspaceMemberIds
                    .filter(id => !existingMemberIds.has(id))
                    .map(workspaceMemberId =>
                        databases.createDocument(
                            DATABASE_ID,
                            CHECKLIST_ITEM_ASSIGNEES_ID,
                            ID.unique(),
                            {
                                itemId,
                                workspaceId,
                                workspaceMemberId,
                                createdBy: member.$id
                            }
                        )
                    )
            );

            return ctx.json({ data: newAssignees });
        }
    )

    // Get assignees for a checklist item
    .get(
        '/assignees/:itemId',
        sessionMiddleware,
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const itemId = ctx.req.param('itemId');

            // Get item to verify workspace access
            const item = await databases.getDocument<ChecklistItem>(
                DATABASE_ID,
                CHECKLIST_ITEMS_ID,
                itemId
            );

            const member = await getMember({
                databases,
                workspaceId: item.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            const assignees = await databases.listDocuments<ChecklistItemAssignee>(
                DATABASE_ID,
                CHECKLIST_ITEM_ASSIGNEES_ID,
                [Query.equal('itemId', itemId)]
            );

            // Get member details
            const memberIds = assignees.documents.map(a => a.workspaceMemberId);
            const members = memberIds.length > 0
                ? await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', memberIds)]
                )
                : { documents: [] };

            const membersById = Object.fromEntries(
                members.documents.map(m => [m.$id, m])
            );

            const populatedAssignees = assignees.documents.map(a => ({
                ...a,
                member: membersById[a.workspaceMemberId]
            }));

            return ctx.json({ data: populatedAssignees });
        }
    )

    // Delete entire checklist (all items and assignees)
    .delete(
        '/all',
        sessionMiddleware,
        zValidator('json', deleteChecklistSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { taskId } = ctx.req.valid('json');

            // Get task to verify workspace access
            const task = await databases.getDocument(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Get all checklist items for this task
            const items = await databases.listDocuments<ChecklistItem>(
                DATABASE_ID,
                CHECKLIST_ITEMS_ID,
                [
                    Query.equal('taskId', taskId),
                    Query.limit(100)
                ]
            );

            const itemIds = items.documents.map(item => item.$id);

            // Delete all assignees for these items
            if (itemIds.length > 0) {
                const assignees = await databases.listDocuments(
                    DATABASE_ID,
                    CHECKLIST_ITEM_ASSIGNEES_ID,
                    [
                        Query.contains('itemId', itemIds),
                        Query.limit(500)
                    ]
                );

                for (const assignee of assignees.documents) {
                    await databases.deleteDocument(
                        DATABASE_ID,
                        CHECKLIST_ITEM_ASSIGNEES_ID,
                        assignee.$id
                    );
                }
            }

            // Delete all checklist items
            for (const item of items.documents) {
                await databases.deleteDocument(
                    DATABASE_ID,
                    CHECKLIST_ITEMS_ID,
                    item.$id
                );
            }

            // Reset task checklist fields
            await databases.updateDocument(
                DATABASE_ID,
                TASKS_ID,
                taskId,
                {
                    checklistCount: 0,
                    checklistCompletedCount: 0,
                    checklistTitle: null,
                }
            );

            // Create activity log for checklist deletion
            await createActivityLog({
                databases,
                taskId,
                actorMemberId: member.$id,
                action: ActivityAction.CHECKLIST_UPDATED,
                payload: {
                    subAction: 'checklist_deleted',
                    checklistTitle: task.checklistTitle || undefined,
                }
            });

            return ctx.json({ data: { taskId } });
        }
    )

export default app;
