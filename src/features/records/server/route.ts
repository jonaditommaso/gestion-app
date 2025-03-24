import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { dataRecordSchema, recordsTableSchema } from "../schemas";
import { DATABASE_ID, RECORDS_ID } from "@/config";
import { ID, Query } from "node-appwrite";

const app = new Hono()

.get(
    '/',
    sessionMiddleware,
    async ctx => {
        const databases = ctx.get('databases');
        const user = ctx.get('user');

        const records = await databases.listDocuments(
            DATABASE_ID,
            RECORDS_ID,
            [Query.equal('userId', user.$id)]
        );

        if(records.total === 0) {
            return ctx.json({ data: { documents: [], total: 0 } })
        }

        return ctx.json({ data: records })
    }
)

.patch(
    "/upload/:recordId",
    zValidator('json', dataRecordSchema),
    sessionMiddleware,
    async (ctx) => {
        const { headers, rows } = ctx.req.valid('json');

        const databases = ctx.get('databases')
        const user = ctx.get('user');

        if(!user) {
            return ctx.json({ error: 'Unauthorized' }, 401)
        }

        const { recordId } = ctx.req.param()

        const records = await databases.updateDocument(
            DATABASE_ID,
            RECORDS_ID,
            recordId,
            {
                headers,
                rows: rows.map((row) => JSON.stringify(row)),
            }
        );

        return ctx.json({ data: records })
    }
)

.post(
    "/records-table",
    zValidator('json', recordsTableSchema),
    sessionMiddleware,
    async (ctx) => {
        const { tableName } = ctx.req.valid('json');

        const databases = ctx.get('databases')
        const user = ctx.get('user');

        const recordsTable = await databases.createDocument(
            DATABASE_ID,
            RECORDS_ID,
            ID.unique(),
            {
                tableName,
                userId: user.$id,
            }
        );

        return ctx.json({ data: recordsTable })
    }
);

export default app;
