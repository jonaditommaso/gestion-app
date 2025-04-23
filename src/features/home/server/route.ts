import { Hono } from "hono";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from '@hono/zod-validator';
import { ID, Query } from "node-appwrite";
import { DATABASE_ID, MESSAGES_ID, NOTES_ID } from "@/config";
import { messagesSchema, notesSchema } from "../schema";

const app = new Hono()

.post(
    '/notes',
    zValidator('json', notesSchema),
    sessionMiddleware,
    async ctx => {
        const user = ctx.get('user');
        const databases = ctx.get('databases');

        const { title, content, bgColor } = ctx.req.valid('json');

        if(!title && !content) {
            return ctx.json({ error: 'Cannot create an empty note' }, 400)
        }

        await databases.createDocument(
            DATABASE_ID,
            NOTES_ID,
            ID.unique(),
            {
                title,
                content,
                bgColor,
                userId: user.$id,
            }
        );

        return ctx.json({ success: true })
    }
)

.get(
    '/notes',
    sessionMiddleware,
    async ctx => {
        const databases = ctx.get('databases');
        const user = ctx.get('user');

        const notes = await databases.listDocuments(
            DATABASE_ID,
            NOTES_ID,
            [Query.equal('userId', user.$id)]
        );

        if(notes.total === 0) {
            return ctx.json({ data: { documents: [], total: 0 } })
        }

        return ctx.json({ data: notes })
    }
)

.post(
    '/messages',
    zValidator('json', messagesSchema),
    sessionMiddleware,
    async ctx => {
        const user = ctx.get('user');
        const databases = ctx.get('databases');

        const { content, to } = ctx.req.valid('json');

        if(!to && !content) {
            return ctx.json({ error: 'Cannot create the message' }, 400)
        }

        await databases.createDocument(
            DATABASE_ID,
            MESSAGES_ID,
            ID.unique(),
            {
                read: false,
                content,
                to,
                from: user.$id,
            }
        );

        return ctx.json({ success: true })
    }
)

export default app;