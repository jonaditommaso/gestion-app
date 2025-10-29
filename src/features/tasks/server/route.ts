import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createTaskSchema, getTaskSchema } from "../schemas";
import { getMember } from "@/features/workspaces/members/utils";
import { DATABASE_ID, MEMBERS_ID, TASKS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite";
import { Task, TaskStatus } from "../types";
import { z as zod } from 'zod';

const app = new Hono()

    .get(
        '/',
        sessionMiddleware,
        zValidator('query', getTaskSchema),
        async (ctx) => {
            const { users } = await createAdminClient();

            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { search, status, workspaceId, dueDate, assigneeId, priority } = ctx.req.valid('query');

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
                Query.orderDesc('$createdAt'),
            ]

            if (assigneeId) {
                query.push(Query.equal('assigneeId', assigneeId))
            }

            if (status) {
                query.push(Query.equal('status', status))
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

            const tasks = await databases.listDocuments<Task>(
                DATABASE_ID,
                TASKS_ID,
                query
            )

            const assigneeIds = tasks.documents.map(task => task.assigneeId)

            const members = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                assigneeIds.length > 0 ? [Query.contains('$id', assigneeIds)] : []
            );

            const assignees = await Promise.all(
                members.documents.map(async member => {
                    const user = await users.get(member.userId)

                    return {
                        ...member,
                        name: user.name,
                        email: user.email
                    }
                })
            )

            const populatedTasks = tasks.documents.map(task => {
                const assignee = assignees.find(assignee => assignee.$id === task.assigneeId);

                return {
                    ...task,
                    assignee
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

            const { name, status, workspaceId, dueDate, assigneeId, priority, description } = ctx.req.valid('json');

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
                [
                    Query.equal('status', status),
                    Query.equal('workspaceId', workspaceId),
                    Query.orderAsc('position'),
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
                    workspaceId,
                    dueDate,
                    assigneeId,
                    priority,
                    description,
                    position: newPosition,
                    userId: user.$id,
                }
            )

            return ctx.json({ data: task })
        }
    )

    .delete(
        '/:taskId',
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

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

            const task = await databases.updateDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId,
                updates
            )

            return ctx.json({ data: task })
        }
    )

    .get(
        '/:taskId',
        sessionMiddleware,
        async ctx => {
            const currentUser = ctx.get('user');
            const databases = ctx.get('databases');

            const { users } = await createAdminClient();
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

            const member = await databases.getDocument(
                DATABASE_ID,
                MEMBERS_ID,
                task.assigneeId
            );

            const user = await users.get(member.userId)

            const assignee = {
                ...member,
                name: user.name,
                email: user.email
            }

            return ctx.json({
                data: {
                    ...task,
                    assignee
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
                const { $id, status, position } = task;

                return databases.updateDocument<Task>(
                    DATABASE_ID,
                    TASKS_ID,
                    $id,
                    { status, position }
                )
            }))

            return ctx.json({ data: updatedTasks })
        }
    )

export default app;