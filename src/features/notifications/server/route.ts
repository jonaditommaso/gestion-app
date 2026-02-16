import { Hono } from "hono";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from '@hono/zod-validator';
import { ID, Query } from "node-appwrite";
import { DATABASE_ID, MEMBERS_ID, NOTIFICATIONS_ID, TASK_ASSIGNEES_ID, TASKS_ID } from "@/config";
import { notificationsSchema } from "../schemas";
import { Models } from "node-appwrite";
import { Task } from "@/features/tasks/types";
import { NotificationBodySeparator, NotificationEntity, NotificationEntityType, NotificationI18nKey, NotificationType } from "../types";
import { shouldNotifyDueDateReminder } from "../helpers";

type WorkspaceMember = Models.Document & {
    userId: string;
    workspaceId: string;
};

type TaskAssignee = Models.Document & {
    taskId: string;
    workspaceMemberId: string;
};

const DUE_DATE_REMINDER_WINDOW_HOURS = 24;

const app = new Hono()

    .post(
        '/',
        zValidator('json', notificationsSchema),
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { userId, triggeredBy, title, read, type, entityType, body } = ctx.req.valid('json');

            const notification = await databases.createDocument(
                DATABASE_ID,
                NOTIFICATIONS_ID,
                ID.unique(),
                {
                    userId,
                    triggeredBy: triggeredBy ?? user.$id,
                    title,
                    read: read ?? false,
                    type,
                    entityType,
                    body,
                }
            );

            return ctx.json({ data: notification })
        }
    )

    .get(
        '/',
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const workspaceMembers = await databases.listDocuments<WorkspaceMember>(
                DATABASE_ID,
                MEMBERS_ID,
                [
                    Query.equal('userId', user.$id),
                    Query.limit(5000)
                ]
            );

            const workspaceMemberIds = workspaceMembers.documents.map((member) => member.$id);

            if (workspaceMemberIds.length > 0) {
                const taskAssignments = await databases.listDocuments<TaskAssignee>(
                    DATABASE_ID,
                    TASK_ASSIGNEES_ID,
                    [
                        Query.contains('workspaceMemberId', workspaceMemberIds),
                        Query.limit(5000)
                    ]
                );

                const assignedTaskIds = [...new Set(taskAssignments.documents.map((assignment) => assignment.taskId))];

                if (assignedTaskIds.length > 0) {
                    const now = new Date();
                    const reminderLimit = new Date(now.getTime() + (DUE_DATE_REMINDER_WINDOW_HOURS * 60 * 60 * 1000));

                    const dueSoonTasks = await databases.listDocuments<Task>(
                        DATABASE_ID,
                        TASKS_ID,
                        [
                            Query.contains('$id', assignedTaskIds),
                            Query.isNotNull('dueDate'),
                            Query.isNull('completedAt'),
                            Query.greaterThanEqual('dueDate', now.toISOString()),
                            Query.lessThanEqual('dueDate', reminderLimit.toISOString()),
                            Query.limit(5000)
                        ]
                    );

                    if (dueSoonTasks.documents.length > 0) {
                        const existingDueReminders = await databases.listDocuments(
                            DATABASE_ID,
                            NOTIFICATIONS_ID,
                            [
                                Query.equal('userId', user.$id),
                                Query.equal('entityType', NotificationEntityType.TASK_DUE_DATE_REMINDER),
                                Query.limit(5000)
                            ]
                        );

                        const existingReminderBodies = new Set(
                            existingDueReminders.documents
                                .map((notification) => notification.body)
                                .filter((body): body is string => typeof body === 'string')
                        );

                        const dueReminderWorkspaceCache = new Map<string, boolean>();

                        const dueReminderTasks = await Promise.all(
                            dueSoonTasks.documents.map(async (task) => {
                                const cachedConfig = dueReminderWorkspaceCache.get(task.workspaceId);

                                if (cachedConfig === false) {
                                    return null;
                                }

                                if (cachedConfig === undefined) {
                                    try {
                                        const canNotify = await shouldNotifyDueDateReminder(task.workspaceId, databases);
                                        dueReminderWorkspaceCache.set(task.workspaceId, canNotify);

                                        if (!canNotify) {
                                            return null;
                                        }
                                    } catch {
                                        dueReminderWorkspaceCache.set(task.workspaceId, false);
                                        return null;
                                    }
                                }

                                const body = `${NotificationI18nKey.VIEW_TASK_LINK}${NotificationBodySeparator}/${NotificationEntity.WORKSPACES}/${task.workspaceId}/${NotificationEntity.TASKS}/${task.$id}`;

                                if (existingReminderBodies.has(body)) {
                                    return null;
                                }

                                return databases.createDocument(
                                    DATABASE_ID,
                                    NOTIFICATIONS_ID,
                                    ID.unique(),
                                    {
                                        userId: user.$id,
                                        triggeredBy: task.createdBy,
                                        title: NotificationI18nKey.TASK_DUE_DATE_REMINDER_TITLE,
                                        read: false,
                                        type: NotificationType.RECURRING,
                                        entityType: NotificationEntityType.TASK_DUE_DATE_REMINDER,
                                        body,
                                    }
                                );
                            })
                        );

                        const createdDueReminders = dueReminderTasks.filter((item) => item !== null);

                        if (createdDueReminders.length > 0) {
                            const createdBodies = createdDueReminders
                                .map((notification) => notification.body)
                                .filter((body): body is string => typeof body === 'string');

                            createdBodies.forEach((body) => existingReminderBodies.add(body));
                        }
                    }
                }
            }

            const notifications = await databases.listDocuments(
                DATABASE_ID,
                NOTIFICATIONS_ID,
                [
                    Query.equal('userId', user.$id),
                    Query.orderDesc('$createdAt')
                ]
            );

            if (notifications.total === 0) {
                return ctx.json({ data: { documents: [], total: 0 } })
            }

            return ctx.json({ data: notifications })
        }
    )

    .post(
        '/read-all',
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const unreadNotifications = await databases.listDocuments(
                DATABASE_ID,
                NOTIFICATIONS_ID,
                [
                    Query.equal('userId', user.$id),
                    Query.equal('read', false)
                ]
            );

            if (unreadNotifications.total === 0) {
                return ctx.json({ data: [] })
            }

            const updatedNotifications = await Promise.all(
                unreadNotifications.documents.map((notification) =>
                    databases.updateDocument(
                        DATABASE_ID,
                        NOTIFICATIONS_ID,
                        notification.$id,
                        {
                            read: true
                        }
                    )
                )
            );

            return ctx.json({ data: updatedNotifications })
        }
    )

export default app;
