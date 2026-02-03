import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { bulkCreateTaskShareSchema, createTaskSchema, createTaskShareSchema, getTaskSchema } from "../schemas";
import { getMember } from "@/features/workspaces/members/utils";
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, MESSAGES_ID, TASK_ASSIGNEES_ID, TASK_SHARES_ID, TASKS_ID, WORKSPACES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { Task, TaskShare, TaskShareType, TaskStatus, WorkspaceMember } from "../types";
import { z as zod } from 'zod';
import { getImageIds, parseTaskMetadata } from "../utils/metadata-helpers";
import { Models, Databases } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite";
import { createActivityLog } from "../utils/create-activity-log";
import { ActivityAction } from "../types/activity-log";
import { WorkspaceType } from "@/features/workspaces/types";

interface TaskAssignee extends Models.Document {
    taskId: string;
    workspaceMemberId: string;
}

// Helper function to get label name from workspace metadata
const getLabelName = async (databases: Databases, workspaceId: string, labelId: string | null | undefined): Promise<string | null> => {
    if (!labelId) return null;

    try {
        const workspace = await databases.getDocument<WorkspaceType>(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        );

        if (!workspace.metadata) return labelId;

        const metadata = typeof workspace.metadata === 'string'
            ? JSON.parse(workspace.metadata)
            : workspace.metadata;

        const customLabels = metadata.customLabels || [];
        const label = customLabels.find((l: { id: string; name: string }) => l.id === labelId);

        return label?.name || labelId;
    } catch {
        return labelId;
    }
};

// Helper function to get status display name from workspace metadata
// For default statuses with custom labels or custom statuses
const getStatusDisplayName = async (
    databases: Databases,
    workspaceId: string,
    status: string,
    statusCustomId: string | null | undefined
): Promise<string | null> => {
    try {
        const workspace = await databases.getDocument<WorkspaceType>(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        );

        if (!workspace.metadata) return null;

        const metadata = typeof workspace.metadata === 'string'
            ? JSON.parse(workspace.metadata)
            : workspace.metadata;

        // If it's a custom status, find it in customStatuses array
        if (status === 'CUSTOM' && statusCustomId) {
            const customStatuses = metadata.customStatuses || [];
            const customStatus = customStatuses.find((s: { id: string; label: string }) => s.id === statusCustomId);
            return customStatus?.label || null;
        }

        // For default statuses, check if there's a custom label override
        const statusLabelKeys: Record<string, string> = {
            'BACKLOG': 'labelBacklog',
            'TODO': 'labelTodo',
            'IN_PROGRESS': 'labelInProgress',
            'IN_REVIEW': 'labelInReview',
            'DONE': 'labelDone',
        };

        const labelKey = statusLabelKeys[status];
        if (labelKey && metadata[labelKey]) {
            return metadata[labelKey];
        }

        return null;
    } catch {
        return null;
    }
};

const app = new Hono()

    .get(
        '/',
        sessionMiddleware,
        zValidator('query', getTaskSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { search, status, statusCustomId, workspaceId, dueDate, assigneeId, priority, label, type, completed, limit } = ctx.req.valid('query');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const query = [
                Query.equal('workspaceId', workspaceId),
                Query.orderAsc('position'),
                // Usar el límite especificado o un valor alto por defecto (máximo de Appwrite es 5000)
                // In future, implement proper way to handle pagination
                Query.limit(limit || 5000),
            ]

            if (status) {
                query.push(Query.equal('status', status))
            }

            // Filtrar por custom status ID si se proporciona
            if (statusCustomId) {
                query.push(Query.equal('statusCustomId', statusCustomId))
            }

            if (dueDate) {
                query.push(Query.equal('dueDate', dueDate))
            }

            if (search) {
                query.push(Query.equal('name', search))
            }

            if (priority) {
                query.push(Query.equal('priority', priority))
            }

            if (label) {
                // Soportar múltiples labels separados por coma
                const labels = label.split(',').map(l => l.trim()).filter(Boolean);
                if (labels.length === 1) {
                    query.push(Query.equal('label', labels[0]));
                } else if (labels.length > 1) {
                    query.push(Query.contains('label', labels));
                }
            }

            if (type) {
                query.push(Query.equal('type', type));
            }

            if (completed) {
                if (completed === 'completed') {
                    query.push(Query.isNotNull('completedAt'));
                } else if (completed === 'incomplete') {
                    query.push(Query.isNull('completedAt'));
                }
                // Si es 'all' no agregamos filtro
            }

            const tasks = await databases.listDocuments<Task>(
                DATABASE_ID,
                TASKS_ID,
                query
            )

            // Obtener todos los task IDs
            let taskIds = tasks.documents.map(task => task.$id);

            // Si hay filtro por assigneeId, obtener solo las tareas asignadas a ese miembro
            if (assigneeId) {
                const assigneeTasksResult = await databases.listDocuments<TaskAssignee>(
                    DATABASE_ID,
                    TASK_ASSIGNEES_ID,
                    [Query.equal('workspaceMemberId', assigneeId), Query.limit(5000)]
                );
                const assigneeTaskIds = assigneeTasksResult.documents.map(ta => ta.taskId);
                // Filtrar taskIds para incluir solo los que están asignados al miembro
                taskIds = taskIds.filter(id => assigneeTaskIds.includes(id));
            }

            // Obtener todas las asignaciones de tareas
            const taskAssignees = taskIds.length > 0
                ? await databases.listDocuments<TaskAssignee>(
                    DATABASE_ID,
                    TASK_ASSIGNEES_ID,
                    [Query.contains('taskId', taskIds), Query.limit(5000)]
                )
                : { documents: [] };

            // Obtener los IDs únicos de workspace members
            const memberIds = [...new Set(taskAssignees.documents.map(ta => ta.workspaceMemberId))];

            // Obtener los datos de los members desde la colección
            const members = memberIds.length > 0
                ? await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', memberIds), Query.limit(5000)]
                )
                : { documents: [] };

            // Mapear las tareas con sus assignees
            const populatedTasks = tasks.documents
                .filter(task => taskIds.includes(task.$id)) // Filtrar por taskIds (incluye filtro de assigneeId si aplica)
                .map(task => {
                    // Encontrar todas las asignaciones para esta tarea
                    const taskAssignments = taskAssignees.documents.filter(ta => ta.taskId === task.$id);

                    // Obtener los miembros asignados a esta tarea
                    const assignees = taskAssignments.map(ta => {
                        return members.documents.find(m => m.$id === ta.workspaceMemberId);
                    }).filter(Boolean); // Eliminar valores undefined

                    return {
                        ...task,
                        assignees // Array de assignees en lugar de assignee único
                    }
                });

            return ctx.json({
                data: { ...tasks, documents: populatedTasks }
            })

        }
    )

    .post(
        '/',
        sessionMiddleware,
        zValidator('json', createTaskSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { name, status, statusCustomId, workspaceId, dueDate, assigneesIds, priority, description, label, type, featured, metadata, parentId } = ctx.req.valid('json');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const highestPositionTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                status === TaskStatus.CUSTOM && statusCustomId
                    ? [
                        Query.equal('status', TaskStatus.CUSTOM),
                        Query.equal('statusCustomId', statusCustomId),
                        Query.equal('workspaceId', workspaceId),
                        Query.orderDesc('position'),
                        Query.limit(1),
                    ]
                    : [
                        Query.equal('status', status),
                        Query.equal('workspaceId', workspaceId),
                        Query.orderDesc('position'),
                        Query.limit(1),
                    ]
            )

            const newPosition = highestPositionTask.documents.length > 0
                ? highestPositionTask.documents[0].position + 1000
                : 1000

            const task = await databases.createDocument(
                DATABASE_ID,
                TASKS_ID,
                ID.unique(),
                {
                    name,
                    status,
                    statusCustomId: status === TaskStatus.CUSTOM ? statusCustomId : null,
                    workspaceId,
                    dueDate,
                    priority,
                    description,
                    position: newPosition,
                    createdBy: member.$id,
                    label: label || null,
                    type: type || 'task',
                    featured: featured || false,
                    metadata: metadata || null,
                    parentId: parentId || null,
                }
            )

            // Create task assignees if exist
            if (assigneesIds && assigneesIds.length > 0) {
                await Promise.all(
                    assigneesIds.map((memberId: string) =>
                        databases.createDocument(
                            DATABASE_ID,
                            TASK_ASSIGNEES_ID,
                            ID.unique(),
                            {
                                taskId: task.$id,
                                workspaceMemberId: memberId,
                            }
                        )
                    )
                );
            }

            // Obtener los datos completos de los assignees
            const assignees = assigneesIds && assigneesIds.length > 0
                ? await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', assigneesIds)]
                )
                : { documents: [] };

            return ctx.json({
                data: {
                    ...task,
                    assignees: assignees.documents
                }
            })
        }
    )

    .delete(
        '/:taskId',
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const storage = ctx.get('storage');

            const { taskId } = ctx.req.param();

            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id
            })

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            // Eliminar todas las imágenes asociadas usando metadata
            const imageIds = getImageIds(task);
            if (imageIds.length > 0) {
                for (const imageId of imageIds) {
                    try {
                        await storage.deleteFile(IMAGES_BUCKET_ID, imageId);
                    } catch (err) {
                        console.error(`Error deleting image ${imageId}:`, err);
                        // Continuar con la eliminación de la tarea aunque falle la eliminación de imágenes
                    }
                }
            }

            // Eliminar todos los assignees de la task
            const assignees = await databases.listDocuments(
                DATABASE_ID,
                TASK_ASSIGNEES_ID,
                [Query.equal('taskId', taskId)]
            );

            for (const assignee of assignees.documents) {
                try {
                    await databases.deleteDocument(
                        DATABASE_ID,
                        TASK_ASSIGNEES_ID,
                        assignee.$id
                    );
                } catch (err) {
                    console.error(`Error deleting task assignee ${assignee.$id}:`, err);
                }
            }

            await databases.deleteDocument(
                DATABASE_ID,
                TASKS_ID,
                taskId
            )

            return ctx.json({ data: { $id: task.$id } })
        }
    )

    .patch(
        '/:taskId',
        sessionMiddleware,
        zValidator('json', createTaskSchema.partial()),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const storage = ctx.get('storage');

            const updates = ctx.req.valid('json');

            const { taskId } = ctx.req.param()

            const existingTask = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            )

            const member = await getMember({
                databases,
                workspaceId: existingTask.workspaceId,
                userId: user.$id
            })

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            // Si se está actualizando metadata, eliminar imágenes que ya no están presentes
            if (updates.metadata !== undefined) {
                const oldImageIds = getImageIds(existingTask);
                const newMetadata = parseTaskMetadata(updates.metadata);
                const newImageIds = newMetadata.imageIds || [];

                // Encontrar imágenes que fueron eliminadas
                const deletedImageIds = oldImageIds.filter(id => !newImageIds.includes(id));

                // Eliminar imágenes que ya no están en el array
                for (const imageId of deletedImageIds) {
                    try {
                        await storage.deleteFile(IMAGES_BUCKET_ID, imageId);
                    } catch (err) {
                        console.error(`Error deleting image ${imageId}:`, err);
                        // Continuar con la actualización aunque falle la eliminación de imágenes
                    }
                }
            }

            // Si se actualiza el status y no es CUSTOM, limpiar statusCustomId
            const finalUpdates = { ...updates };
            if (updates.status && updates.status !== TaskStatus.CUSTOM) {
                finalUpdates.statusCustomId = null;
            }

            let task;
            try {
                task = await databases.updateDocument<Task>(
                    DATABASE_ID,
                    TASKS_ID,
                    taskId,
                    finalUpdates
                )
            } catch (err: unknown) {
                // Check if it's an Appwrite error for field length
                const error = err as { type?: string; message?: string };
                if (error.type === 'document_invalid_structure' && error.message?.includes('2048')) {
                    return ctx.json({ error: 'content_too_long' }, 400);
                }
                throw err;
            }

            // Create activity logs for each change (in parallel, non-blocking)
            const activityLogPromises: Promise<void>[] = [];

            // Status change
            if (updates.status !== undefined && (updates.status !== existingTask.status || updates.statusCustomId !== existingTask.statusCustomId)) {
                // Get display names for the statuses (custom label or null)
                const [fromDisplayName, toDisplayName] = await Promise.all([
                    getStatusDisplayName(databases, existingTask.workspaceId, existingTask.status, existingTask.statusCustomId),
                    getStatusDisplayName(databases, existingTask.workspaceId, updates.status, updates.statusCustomId)
                ]);

                activityLogPromises.push(
                    createActivityLog({
                        databases,
                        taskId,
                        actorMemberId: member.$id,
                        action: ActivityAction.TASK_STATUS_UPDATED,
                        payload: {
                            from: existingTask.status,
                            fromCustomId: fromDisplayName,
                            to: updates.status,
                            toCustomId: toDisplayName
                        }
                    })
                );
            }

            // Description change
            if (updates.description !== undefined && updates.description !== existingTask.description) {
                activityLogPromises.push(
                    createActivityLog({
                        databases,
                        taskId,
                        actorMemberId: member.$id,
                        action: ActivityAction.DESCRIPTION_UPDATED,
                        payload: {
                            subAction: updates.description ? 'set' : 'cleared'
                        }
                    })
                );
            }

            // Label change
            if (updates.label !== undefined && updates.label !== existingTask.label) {
                // Get label names (snapshot) instead of IDs
                const [fromLabelName, toLabelName] = await Promise.all([
                    getLabelName(databases, existingTask.workspaceId, existingTask.label),
                    getLabelName(databases, existingTask.workspaceId, updates.label)
                ]);

                activityLogPromises.push(
                    createActivityLog({
                        databases,
                        taskId,
                        actorMemberId: member.$id,
                        action: ActivityAction.LABEL_UPDATED,
                        payload: {
                            from: fromLabelName,
                            to: toLabelName
                        }
                    })
                );
            }

            // Priority change
            if (updates.priority !== undefined && updates.priority !== existingTask.priority) {
                activityLogPromises.push(
                    createActivityLog({
                        databases,
                        taskId,
                        actorMemberId: member.$id,
                        action: ActivityAction.PRIORITY_UPDATED,
                        payload: {
                            from: existingTask.priority || 3,
                            to: updates.priority
                        }
                    })
                );
            }

            // Due date change
            if (updates.dueDate !== undefined) {
                const newDueDateStr = updates.dueDate ? updates.dueDate.toISOString() : null;
                if (newDueDateStr !== existingTask.dueDate) {
                    activityLogPromises.push(
                        createActivityLog({
                            databases,
                            taskId,
                            actorMemberId: member.$id,
                            action: ActivityAction.DUE_DATE_UPDATED,
                            payload: {
                                from: existingTask.dueDate || null,
                                to: newDueDateStr
                            }
                        })
                    );
                }
            }

            // Type change
            if (updates.type !== undefined && updates.type !== existingTask.type) {
                activityLogPromises.push(
                    createActivityLog({
                        databases,
                        taskId,
                        actorMemberId: member.$id,
                        action: ActivityAction.TASK_TYPE_UPDATED,
                        payload: {
                            from: existingTask.type || 'task',
                            to: updates.type
                        }
                    })
                );
            }

            // Name change
            if (updates.name !== undefined && updates.name !== existingTask.name) {
                activityLogPromises.push(
                    createActivityLog({
                        databases,
                        taskId,
                        actorMemberId: member.$id,
                        action: ActivityAction.TASK_NAME_UPDATED,
                        payload: {
                            from: existingTask.name,
                            to: updates.name
                        }
                    })
                );
            }

            // Featured change
            if (updates.featured !== undefined && updates.featured !== existingTask.featured) {
                activityLogPromises.push(
                    createActivityLog({
                        databases,
                        taskId,
                        actorMemberId: member.$id,
                        action: ActivityAction.TASK_FEATURED_UPDATED,
                        payload: {
                            from: existingTask.featured || false,
                            to: updates.featured
                        }
                    })
                );
            }

            // Checklist title change
            if (updates.checklistTitle !== undefined && updates.checklistTitle !== existingTask.checklistTitle) {
                activityLogPromises.push(
                    createActivityLog({
                        databases,
                        taskId,
                        actorMemberId: member.$id,
                        action: ActivityAction.CHECKLIST_UPDATED,
                        payload: {
                            subAction: 'title_changed',
                            checklistTitle: updates.checklistTitle || undefined
                        }
                    })
                );
            }

            // Execute all activity log creations in parallel (non-blocking)
            Promise.all(activityLogPromises).catch(err => {
                console.error('Error creating activity logs:', err);
            });

            // Obtener las asignaciones de esta tarea
            const taskAssignees = await databases.listDocuments<TaskAssignee>(
                DATABASE_ID,
                TASK_ASSIGNEES_ID,
                [Query.equal('taskId', taskId)]
            );

            // Obtener los IDs de los workspace members
            const memberIds = taskAssignees.documents.map(ta => ta.workspaceMemberId);

            // Obtener los datos de los members
            const assignees = memberIds.length > 0
                ? await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', memberIds)]
                )
                : { documents: [] };

            return ctx.json({
                data: {
                    ...task,
                    assignees: assignees.documents
                }
            })
        }
    )

    .get(
        '/:taskId',
        sessionMiddleware,
        async ctx => {
            const currentUser = ctx.get('user');
            const databases = ctx.get('databases');

            const { taskId } = ctx.req.param();

            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            )

            const currentMember = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: currentUser.$id
            });

            if (!currentMember) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            // Obtener las asignaciones de esta tarea
            const taskAssignees = await databases.listDocuments<TaskAssignee>(
                DATABASE_ID,
                TASK_ASSIGNEES_ID,
                [Query.equal('taskId', taskId)]
            );

            // Obtener los IDs de los workspace members
            const memberIds = taskAssignees.documents.map(ta => ta.workspaceMemberId);

            // Obtener los datos de los members
            const assignees = memberIds.length > 0
                ? await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', memberIds)]
                )
                : { documents: [] };

            return ctx.json({
                data: {
                    ...task,
                    assignees: assignees.documents
                }
            })
        }
    )

    .post(
        '/bulk-update',
        sessionMiddleware,
        zValidator(
            'json',
            zod.object({
                tasks: zod.array(
                    zod.object({
                        $id: zod.string(),
                        status: zod.nativeEnum(TaskStatus),
                        statusCustomId: zod.string().optional().nullable(),
                        position: zod.number().int().positive().min(1000).max(1_000_000)
                    })
                )
            })
        ),
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { tasks } = await ctx.req.valid('json');

            const tasksToUpdate = await databases.listDocuments<Task>(
                DATABASE_ID,
                TASKS_ID,
                [Query.contains('$id', tasks.map(task => task.$id))]
            )

            const workspaceIds = new Set(tasksToUpdate.documents.map(task => task.workspaceId))

            if (workspaceIds.size !== 1) {
                return ctx.json({ error: 'All tasks must belong to the same workspace' })
            }

            const workspaceId = workspaceIds.values().next().value!;

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const updatedTasks = await Promise.all(tasks.map(async task => {
                const { $id, status, statusCustomId, position } = task;

                return databases.updateDocument<Task>(
                    DATABASE_ID,
                    TASKS_ID,
                    $id,
                    {
                        status,
                        position,
                        // Si es CUSTOM, guardar el ID; si no, limpiar el campo
                        statusCustomId: status === TaskStatus.CUSTOM ? statusCustomId : null
                    }
                )
            }))

            return ctx.json({ data: updatedTasks })
        }
    )

    .post(
        '/:taskId/assign',
        sessionMiddleware,
        zValidator('json', zod.object({
            workspaceMemberId: zod.string()
        })),
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { taskId } = ctx.req.param();
            const { workspaceMemberId } = ctx.req.valid('json');

            // Get task
            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            // Check authorization
            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Check if already assigned
            const existingAssignment = await databases.listDocuments<TaskAssignee>(
                DATABASE_ID,
                TASK_ASSIGNEES_ID,
                [
                    Query.equal('taskId', taskId),
                    Query.equal('workspaceMemberId', workspaceMemberId)
                ]
            );

            if (existingAssignment.documents.length > 0) {
                return ctx.json({ error: 'Member already assigned' }, 400);
            }

            // Create assignment
            await databases.createDocument(
                DATABASE_ID,
                TASK_ASSIGNEES_ID,
                ID.unique(),
                {
                    taskId,
                    workspaceMemberId
                }
            );

            // Get the assigned member's info for the activity log
            const assignedMember = await databases.getDocument<WorkspaceMember>(
                DATABASE_ID,
                MEMBERS_ID,
                workspaceMemberId
            );

            // Create activity log for assignment (non-blocking)
            createActivityLog({
                databases,
                taskId,
                actorMemberId: member.$id,
                action: ActivityAction.ASSIGNEES_UPDATED,
                payload: {
                    subAction: 'added',
                    memberId: workspaceMemberId,
                    memberName: assignedMember.name
                }
            }).catch(err => console.error('Error creating activity log:', err));

            // Get updated assignees
            const taskAssignees = await databases.listDocuments<TaskAssignee>(
                DATABASE_ID,
                TASK_ASSIGNEES_ID,
                [Query.equal('taskId', taskId)]
            );

            const memberIds = taskAssignees.documents.map(ta => ta.workspaceMemberId);
            const assignees = memberIds.length > 0
                ? await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', memberIds)]
                )
                : { documents: [] };

            return ctx.json({
                data: {
                    ...task,
                    assignees: assignees.documents
                }
            });
        }
    )

    .delete(
        '/:taskId/assign/:workspaceMemberId',
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { taskId, workspaceMemberId } = ctx.req.param();

            // Get task
            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            // Check authorization
            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Find assignment
            const assignment = await databases.listDocuments<TaskAssignee>(
                DATABASE_ID,
                TASK_ASSIGNEES_ID,
                [
                    Query.equal('taskId', taskId),
                    Query.equal('workspaceMemberId', workspaceMemberId)
                ]
            );

            if (assignment.documents.length === 0) {
                return ctx.json({ error: 'Assignment not found' }, 404);
            }

            // Get the member being unassigned for the activity log
            const unassignedMember = await databases.getDocument<WorkspaceMember>(
                DATABASE_ID,
                MEMBERS_ID,
                workspaceMemberId
            );

            // Delete assignment
            await databases.deleteDocument(
                DATABASE_ID,
                TASK_ASSIGNEES_ID,
                assignment.documents[0].$id
            );

            // Create activity log for unassignment (non-blocking)
            createActivityLog({
                databases,
                taskId,
                actorMemberId: member.$id,
                action: ActivityAction.ASSIGNEES_UPDATED,
                payload: {
                    subAction: 'removed',
                    memberId: workspaceMemberId,
                    memberName: unassignedMember.name
                }
            }).catch(err => console.error('Error creating activity log:', err));

            // Get updated assignees
            const taskAssignees = await databases.listDocuments<TaskAssignee>(
                DATABASE_ID,
                TASK_ASSIGNEES_ID,
                [Query.equal('taskId', taskId)]
            );

            const memberIds = taskAssignees.documents.map(ta => ta.workspaceMemberId);
            const assignees = memberIds.length > 0
                ? await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', memberIds)]
                )
                : { documents: [] };

            return ctx.json({
                data: {
                    ...task,
                    assignees: assignees.documents
                }
            });
        }
    )

    .post(
        '/upload-task-image',
        sessionMiddleware,
        zValidator('form', zod.object({
            image: zod.any(),
            // workspaceId: zod.string()
        })),
        async ctx => {
            // TODO: check member authorization
            // const user = ctx.get('user');
            const storage = ctx.get('storage');
            // const databases = ctx.get('databases');

            const body = await ctx.req.formData();
            const image = body.get('image');
            // const workspaceId = body.get('workspaceId') as string;

            // if (!workspaceId) {
            //     return ctx.json({ error: 'workspaceId is required' }, 400);
            // }

            // // Verificar que el usuario es miembro del workspace
            // const member = await getMember({
            //     databases,
            //     workspaceId,
            //     userId: user.$id
            // });

            // if (!member) {
            //     return ctx.json({ error: 'Unauthorized' }, 401);
            // }

            if (image && image instanceof File) {
                try {
                    // Subir la imagen al bucket
                    const file = await storage.createFile(
                        IMAGES_BUCKET_ID,
                        ID.unique(),
                        image
                    );

                    // Generar la URL para acceder a la imagen
                    const imageUrl = `/api/tasks/image/${file.$id}`;

                    return ctx.json({
                        success: true,
                        data: {
                            fileId: file.$id,
                            url: imageUrl
                        }
                    });
                } catch (err) {
                    console.error('Error uploading image:', err);
                    return ctx.json({ error: 'Failed to upload image' }, 500);
                }
            }

            return ctx.json({ error: 'No file uploaded' }, 400);
        }
    )

    .get(
        '/image/:fileId',
        sessionMiddleware,
        async ctx => {
            const storage = ctx.get('storage');
            const { fileId } = ctx.req.param();

            try {
                const fileMetadata = await storage.getFile(IMAGES_BUCKET_ID, fileId);
                const mimeType = fileMetadata.mimeType;

                const fileBuffer = await storage.getFileView(IMAGES_BUCKET_ID, fileId);

                return new Response(fileBuffer, {
                    headers: {
                        'Content-Type': mimeType,
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            } catch (err) {
                console.error('Error fetching image:', err);
                return ctx.json({ error: 'Image not found' }, 404);
            }
        }
    )

    .post(
        '/share',
        sessionMiddleware,
        zValidator('json', createTaskShareSchema),
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { taskId, workspaceId, token, expiresAt, type, sharedBy, sharedTo, readOnly } = ctx.req.valid('json');

            // Verificar que el usuario es miembro del workspace
            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Verificar que la tarea existe y pertenece al workspace
            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            if (task.workspaceId !== workspaceId) {
                return ctx.json({ error: 'Task does not belong to this workspace' }, 400);
            }

            // Crear el documento de share
            await databases.createDocument(
                DATABASE_ID,
                TASK_SHARES_ID,
                ID.unique(),
                {
                    taskId,
                    workspaceId,
                    token: token || null,
                    expiresAt: expiresAt || null,
                    type,
                    sharedBy,
                    sharedTo: sharedTo || null,
                    readOnly,
                }
            );

            // Create activity log for task share
            createActivityLog({
                databases,
                taskId,
                actorMemberId: member.$id,
                action: ActivityAction.TASK_SHARED,
                payload: {
                    subAction: type === TaskShareType.INTERNAL ? 'internal' : 'external',
                    sharedToUserId: sharedTo || undefined,
                },
            });

            return ctx.json({ success: true });
        }
    )

    .get(
        '/shared/:token',
        async ctx => {
            const { databases } = await createAdminClient();
            const { token } = ctx.req.param();

            // Buscar el share por token
            const shares = await databases.listDocuments<TaskShare>(
                DATABASE_ID,
                TASK_SHARES_ID,
                [Query.equal('token', token)]
            );

            if (shares.documents.length === 0) {
                return ctx.json({ error: 'Share not found' }, 404);
            }

            const share = shares.documents[0];

            // Verificar si el enlace ha expirado
            if (share.expiresAt) {
                const expiresAt = new Date(share.expiresAt);
                if (expiresAt < new Date()) {
                    return ctx.json({ error: 'Link expired' }, 410);
                }
            }

            // Obtener la tarea
            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                share.taskId
            );

            // Obtener los assignees de la tarea
            const taskAssignees = await databases.listDocuments<TaskAssignee>(
                DATABASE_ID,
                TASK_ASSIGNEES_ID,
                [Query.equal('taskId', share.taskId)]
            );

            const memberIds = taskAssignees.documents.map(ta => ta.workspaceMemberId);
            const assignees = memberIds.length > 0
                ? await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', memberIds)]
                )
                : { documents: [] };

            return ctx.json({
                data: {
                    task: {
                        ...task,
                        assignees: assignees.documents
                    },
                    readOnly: share.readOnly
                }
            });
        }
    )

    .post(
        '/share/bulk',
        sessionMiddleware,
        zValidator('json', bulkCreateTaskShareSchema),
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { taskId, taskName, workspaceId, recipients, message, locale } = ctx.req.valid('json');

            // Traducciones para el mensaje de compartir
            const shareMessageTranslations = {
                es: (name: string) => `${name} te ha compartido una tarea`,
                en: (name: string) => `${name} shared a task with you`,
                it: (name: string) => `${name} ha condiviso un'attività con te`,
            };

            // Verificar que el usuario es miembro del workspace
            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Verificar que la tarea existe y pertenece al workspace
            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            if (task.workspaceId !== workspaceId) {
                return ctx.json({ error: 'Task does not belong to this workspace' }, 400);
            }

            // Construir el enlace base
            const origin = ctx.req.header('origin') || ctx.req.header('referer')?.replace(/\/$/, '') || '';

            // Crear shares y mensajes para cada recipient
            const sharePromises = recipients.map(async (recipient) => {
                let taskLink: string;
                let token: string | null = null;

                if (recipient.isWorkspaceMember) {
                    // Miembro del workspace: link directo
                    taskLink = `${origin}/workspaces/${workspaceId}/tasks/${taskId}`;
                } else {
                    // Miembro del team (no workspace): generar token sin expiración
                    token = crypto.randomUUID();
                    taskLink = `${origin}/shared/task/${token}`;
                }

                // Crear el documento de share
                await databases.createDocument(
                    DATABASE_ID,
                    TASK_SHARES_ID,
                    ID.unique(),
                    {
                        taskId,
                        workspaceId,
                        token,
                        expiresAt: null, // Sin expiración para shares internos
                        type: TaskShareType.INTERNAL,
                        sharedBy: user.$id,
                        sharedTo: recipient.userId,
                        readOnly: !recipient.isWorkspaceMember,
                    }
                );

                // Construir el contenido del mensaje usando la traducción correcta
                const translatedHeader = shareMessageTranslations[locale](member.name);
                let messageContent = `📋 ${translatedHeader}: "${taskName}"\n\n🔗 ${taskLink}`;
                if (message && message.trim()) {
                    messageContent = `📋 ${translatedHeader}: "${taskName}"\n\n💬 "${message.trim()}"\n\n🔗 ${taskLink}`;
                }

                // Crear el mensaje para el recipient
                await databases.createDocument(
                    DATABASE_ID,
                    MESSAGES_ID,
                    ID.unique(),
                    {
                        read: false,
                        content: messageContent,
                        to: recipient.userId,
                        from: user.$id,
                        userId: user.$id
                    }
                );
            });

            await Promise.all(sharePromises);

            // Create activity log for bulk task share
            createActivityLog({
                databases,
                taskId,
                actorMemberId: member.$id,
                action: ActivityAction.TASK_SHARED,
                payload: {
                    subAction: 'internal',
                    recipientCount: recipients.length,
                },
            });

            return ctx.json({ success: true });
        }
    )

    // Get subtasks for an epic task
    .get(
        '/subtasks/:parentId',
        sessionMiddleware,
        zValidator('query', zod.object({
            workspaceId: zod.string()
        })),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { parentId } = ctx.req.param();
            const { workspaceId } = ctx.req.valid('query');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Get all subtasks for this parent
            const subtasks = await databases.listDocuments<Task>(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal('parentId', parentId),
                    Query.equal('workspaceId', workspaceId),
                    Query.orderAsc('position'),
                    Query.limit(100)
                ]
            );

            // Get assignees for all subtasks
            const subtaskIds = subtasks.documents.map(t => t.$id);

            const taskAssignees = subtaskIds.length > 0
                ? await databases.listDocuments<TaskAssignee>(
                    DATABASE_ID,
                    TASK_ASSIGNEES_ID,
                    [Query.contains('taskId', subtaskIds), Query.limit(500)]
                )
                : { documents: [] };

            // Get unique member IDs from assignees
            const memberIds = [...new Set(taskAssignees.documents.map(ta => ta.workspaceMemberId))];

            // Get member data
            const members = memberIds.length > 0
                ? await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', memberIds)]
                )
                : { documents: [] };

            // Create a map of memberId to member data
            const memberMap = new Map(members.documents.map(m => [m.$id, m]));

            // Populate subtasks with assignees
            const populatedSubtasks = subtasks.documents.map(task => {
                const taskAssigneeIds = taskAssignees.documents
                    .filter(ta => ta.taskId === task.$id)
                    .map(ta => ta.workspaceMemberId);

                const assignees = taskAssigneeIds
                    .map(id => memberMap.get(id))
                    .filter(Boolean) as WorkspaceMember[];

                return {
                    ...task,
                    assignees
                };
            });

            return ctx.json({
                data: {
                    documents: populatedSubtasks,
                    total: subtasks.total
                }
            });
        }
    )

export default app;