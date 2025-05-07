import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { recordSchema, recordsTableSchema, recordsTableNameSchema } from "../schemas";
import { DATABASE_ID, RECORD_TABLES_ID, RECORDS_ID } from "@/config";
import { ID, Query } from "node-appwrite";

const app = new Hono()

    // obtener las tablas
    .get(
        '/',
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const tables = await databases.listDocuments(
                DATABASE_ID,
                RECORD_TABLES_ID,
                [Query.equal('teamId', user.prefs.teamId)]
            );

            if (tables.total === 0) {
                return ctx.json({ data: { documents: [], total: 0 } })
            }

            return ctx.json({ data: tables })
        }
    )

    // obtener los registros de una tabla
    .get(
        '/:tableId',
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');

            const { tableId } = ctx.req.param();

            const records = await databases.listDocuments(
                DATABASE_ID,
                RECORDS_ID,
                [
                    Query.equal('tableId', tableId)
                ]
            );

            return ctx.json({ data: records })
        }
    )

    // actualiza la tabla, ya sea agregando headers por primera vez o nuevos.
    .patch(
        "/upload/:tableId",
        zValidator('json', recordsTableSchema),
        sessionMiddleware,
        async (ctx) => {
            const { headers } = ctx.req.valid('json');

            const databases = ctx.get('databases');
            const user = ctx.get('user');

            if (!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const { tableId } = ctx.req.param()

            const records = await databases.updateDocument(
                DATABASE_ID,
                RECORD_TABLES_ID,
                tableId,
                {
                    headers,
                }
            );

            return ctx.json({ data: records })
        }
    )

    // crea datos para una tabla en particular
    .post(
        "/upload",
        zValidator('json', recordSchema),
        sessionMiddleware,
        async (ctx) => {
            const { data, tableId } = ctx.req.valid('json');

            const databases = ctx.get('databases');
            const user = ctx.get('user');

            if (!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const records = await databases.createDocument(
                DATABASE_ID,
                RECORDS_ID,
                ID.unique(),
                {
                    data: data.map(record => JSON.stringify(record)),
                    tableId,
                    createdBy: user.$id,
                    teamId: user.prefs.teamId
                }
            );

            return ctx.json({ data: records })
        }
    )

    //crear la tabla (solo con el name)
    .post(
        "/records-table",
        zValidator('json', recordsTableNameSchema),
        sessionMiddleware,
        async (ctx) => {
            const { tableName } = ctx.req.valid('json');

            const databases = ctx.get('databases')
            const user = ctx.get('user');

            const recordsTable = await databases.createDocument(
                DATABASE_ID,
                RECORD_TABLES_ID,
                ID.unique(),
                {
                    tableName,
                    createdBy: user.$id,
                    teamId: user.prefs.teamId
                }
            );

            return ctx.json({ data: recordsTable })
        }
    )

    .delete(
        '/records-table/:tableId',
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const { tableId } = ctx.req.param();

            await databases.deleteDocument(
                DATABASE_ID,
                RECORD_TABLES_ID,
                tableId
            );

            const remaining = await databases.listDocuments(
                DATABASE_ID,
                RECORD_TABLES_ID,
                [Query.equal('userId', user.$id)]
            );

            return ctx.json({ data: { $id: tableId, remaining: remaining.total } })
        }
    )

    .patch(
        "/records-table/:tableId",
        zValidator('json', recordsTableNameSchema),
        sessionMiddleware,
        async (ctx) => {
            const { tableName } = ctx.req.valid('json');

            const databases = ctx.get('databases')
            const user = ctx.get('user');

            if (!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const { tableId } = ctx.req.param()

            const table = await databases.updateDocument(
                DATABASE_ID,
                RECORD_TABLES_ID,
                tableId,
                {
                    tableName
                }
            );

            return ctx.json({ data: table })
        }
    )

export default app;
