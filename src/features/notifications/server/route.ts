import { Hono } from "hono";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from '@hono/zod-validator';
import { ID, Query } from "node-appwrite";
import { DATABASE_ID, NOTIFICATIONS_ID } from "@/config";
import { notificationsSchema } from "../schemas";

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
