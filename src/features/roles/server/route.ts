import { Hono } from "hono";
import { rolePermissionsSchema, rolePermissionsUpdateSchema, roleUser } from "./schemas";
import { zValidator } from "@hono/zod-validator";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, ROLES_PERMISSIONS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite";

const app = new Hono()

    .get(
        '/',
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const rolesPermissions = await databases.listDocuments(
                DATABASE_ID,
                ROLES_PERMISSIONS_ID,
                [Query.equal('teamId', user.prefs.teamId)]
            );

            if (rolesPermissions.total === 0) {
                return ctx.json({ data: { documents: [], total: 0 } })
            }

            return ctx.json({ data: rolesPermissions })
        }
    )

    .post(
        '/',
        zValidator('json', rolePermissionsSchema),
        sessionMiddleware,
        async (ctx) => {
            const { role, permissions } = ctx.req.valid('json');

            const databases = ctx.get('databases');
            const user = ctx.get('user');

            if (!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const rolePermissions = await databases.createDocument(
                DATABASE_ID,
                ROLES_PERMISSIONS_ID,
                ID.unique(),
                {
                    permissions,
                    role,
                    teamId: user.prefs.teamId
                }
            );

            return ctx.json({ data: rolePermissions })
        }
    )

    .patch(
        '/:roleId',
        zValidator('json', rolePermissionsUpdateSchema),
        sessionMiddleware,
        async (ctx) => {
            const { permissions } = ctx.req.valid('json');

            const databases = ctx.get('databases');
            const user = ctx.get('user');

            if (!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const { roleId } = ctx.req.param()

            const rolePermissions = await databases.updateDocument(
                DATABASE_ID,
                ROLES_PERMISSIONS_ID,
                roleId,
                {
                    permissions,
                    // role,
                    // teamId: user.prefs.teamId
                }
            );

            return ctx.json({ data: rolePermissions })
        }
    )

    .patch(
        '/user/:id',
        zValidator('json', roleUser),
        sessionMiddleware,
        async (ctx) => {
            const { users } = await createAdminClient();

            const { role } = ctx.req.valid('json');
            const { id } = ctx.req.param();

            const prefs = await users.getPrefs(id);

            await users.updatePrefs(id, {
                ...(prefs ?? {}),
                role: role,
            });

            return ctx.json({ success: true })

        }
    )

export default app;