import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { recordSchema, recordsTableSchema, recordsTableNameSchema } from "../schemas";
import { DATABASE_ID, FILES_ID, IMAGES_BUCKET_ID, RECORD_TABLES_ID, RECORDS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { Record } from "../types";
import { getActiveContext } from "@/features/team/server/utils";

const app = new Hono()

    // obtener las tablas
    .get(
        '/',
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ data: { documents: [], total: 0 } });

            const tables = await databases.listDocuments(
                DATABASE_ID,
                RECORD_TABLES_ID,
                [Query.equal('teamId', context.org.appwriteTeamId)]
            );

            if (tables.total === 0) {
                return ctx.json({ data: { documents: [], total: 0 } })
            }

            return ctx.json({ data: tables })
        }
    )

    // obtener los registros de una tabla
    .get(
        '/record-headers/:tableId',
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

    .get(
        '/:recordId',
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            if (!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const { recordId } = ctx.req.param();

            const record = await databases.getDocument<Record>(
                DATABASE_ID,
                RECORDS_ID,
                recordId
            );

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context || context.org.appwriteTeamId !== record.teamId) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            return ctx.json({ data: record })
        }
    )

    .post(
        '/upload-file/:recordId',
        // zValidator('json', fileSchema),
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const storage = ctx.get('storage');
            const databases = ctx.get('databases');

            if (!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const body = await ctx.req.formData()
            const file = body.get('file');
            const { recordId } = ctx.req.param()

            if (file && file instanceof File) {

                const newFile = await storage.createFile(
                    IMAGES_BUCKET_ID,
                    ID.unique(),
                    file
                );

                const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
                if (!context) return ctx.json({ success: false, message: 'No active organization' }, 400);

                await databases.createDocument(
                    DATABASE_ID,
                    FILES_ID,
                    ID.unique(),
                    {
                        teamId: context.org.appwriteTeamId,
                        bucketFileId: newFile.$id,
                        createdBy: user.$id,
                        recordId: recordId
                    }
                );

                return ctx.json({ success: true })
            }

            return ctx.json({ success: false, message: 'No file uploaded' }, 400);
        }
    )

    .get(
        '/files/:recordId',
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user')

            const { recordId } = ctx.req.param();

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ data: { documents: [], total: 0 } });

            const files = await databases.listDocuments(
                DATABASE_ID,
                FILES_ID,
                [
                    Query.equal('teamId', context.org.appwriteTeamId),
                    Query.equal('recordId', recordId)
                ]
            );

            return ctx.json({ data: files })
        }
    )

    .get(
        '/record-file/:id',
        sessionMiddleware,
        async ctx => {
            const storage = ctx.get('storage');
            const user = ctx.get('user');

            const { id } = ctx.req.param();

            if (!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            try {
                const fileMetadata = await storage.getFile(IMAGES_BUCKET_ID, id);

                const mimeType = fileMetadata.mimeType;
                const fileName = fileMetadata.name || '';

                const fileBuffer = await storage.getFileView(IMAGES_BUCKET_ID, id);

                return new Response(fileBuffer, {
                    headers: {
                        'Content-Type': mimeType,
                        'Content-Disposition': fileName,
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            } catch (err) {
                console.error('Error al obtener la imagen:', err);
                return ctx.json({ success: false, message: 'Error fetching the image' }, 500);
            }
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

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ error: 'No active organization' }, 400);

            const records = await databases.createDocument(
                DATABASE_ID,
                RECORDS_ID,
                ID.unique(),
                {
                    data: data.map(record => JSON.stringify(record)),
                    tableId,
                    createdBy: user.$id,
                    teamId: context.org.appwriteTeamId
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

            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ error: 'No active organization' }, 400);

            const recordsTable = await databases.createDocument(
                DATABASE_ID,
                RECORD_TABLES_ID,
                ID.unique(),
                {
                    tableName,
                    createdBy: user.$id,
                    teamId: context.org.appwriteTeamId
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
