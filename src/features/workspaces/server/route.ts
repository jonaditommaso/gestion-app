import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { createWorkspaceSchema, updateWorkspaceSchema } from '../schema';
import { sessionMiddleware } from '@/lib/session-middleware';
import { DATABASE_ID, MEMBERS_ID, TASKS_ID, WORKSPACES_ID } from '@/config';
import { ID, Query } from 'node-appwrite';
import { MemberRole } from '../members/types';
import { generateInviteCode } from '@/lib/utils';
import { getMember } from '../members/utils';
import { z as zod } from 'zod';
import { WorkspaceType } from '../types';

const app = new Hono()

    .get(
        '/',
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const members = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.equal('userId', user.$id)]
            );

            if (members.total === 0) {
                return ctx.json({ data: { documents: [], total: 0 } })
            }

            const workspacesIds = members.documents.map(member => member.workspaceId)

            const workspaces = await databases.listDocuments(
                DATABASE_ID,
                WORKSPACES_ID,
                [
                    Query.orderDesc('$createdAt'),
                    Query.contains('teamId', user.prefs.teamId),
                    Query.contains('$id', workspacesIds),
                ]
            );

            return ctx.json({ data: workspaces })
        }
    )
    .get(
        '/count',
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const workspaces = await databases.listDocuments(
                DATABASE_ID,
                WORKSPACES_ID,
                [Query.equal('teamId', user.prefs.teamId)]
            );

            return ctx.json({ data: { count: workspaces.total } })
        }
    )
    .post(
        '/', // nuestro base endpoint es /workspaces que definimos en [[...route]], asique ponemos el slash vacio
        zValidator('json', createWorkspaceSchema),
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases') // obtenemos la db del contexto, porque lo seteamos previamente en el session middleware
            const user = ctx.get('user');

            const { name } = ctx.req.valid('json');

            const workspace = await databases.createDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                ID.unique(),
                {
                    name,
                    createdBy: user.$id,
                    teamId: user.prefs.teamId,
                    inviteCode: generateInviteCode(6),
                    userId: user.$id,
                }
            );

            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    userId: user.$id,
                    workspaceId: workspace.$id,
                    role: MemberRole.ADMIN
                }
            )

            return ctx.json({ data: workspace })
        }
    )
    .patch(
        '/:workspaceId',
        sessionMiddleware,
        zValidator('json', updateWorkspaceSchema),
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const { workspaceId } = ctx.req.param();
            const { name, description, metadata, archived } = ctx.req.valid('json');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member || member.role !== MemberRole.ADMIN) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const updateData: Partial<WorkspaceType> = {};
            if (name !== undefined) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (metadata !== undefined) updateData.metadata = metadata;
            if (archived !== undefined) updateData.archived = archived;

            const workspace = await databases.updateDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId,
                updateData
            );

            return ctx.json({ data: workspace });

        }
    )
    .post(
        '/:workspaceId/join',
        sessionMiddleware,
        zValidator('json', zod.object({ code: zod.string() })),
        async ctx => {
            const { workspaceId } = ctx.req.param();
            const { code } = ctx.req.valid('json');

            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (member) {
                return ctx.json({ error: 'Ya es miembro' }, 400)
            }

            const workspace = await databases.getDocument<WorkspaceType>(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId
            );

            if (workspace.inviteCode !== code) {
                return ctx.json({ error: 'Invalid invite code' }, 400)
            }

            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    workspaceId,
                    userId: user.$id,
                    role: MemberRole.MEMBER
                }
            );

            return ctx.json({ data: workspace });

        }
    )
    .delete(
        '/:workspaceId',
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const { workspaceId } = ctx.req.param();

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member || member.role !== MemberRole.ADMIN) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            // Delete all tasks of the workspace
            const tasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [Query.equal('workspaceId', workspaceId)]
            );

            for (const task of tasks.documents) {
                await databases.deleteDocument(
                    DATABASE_ID,
                    TASKS_ID,
                    task.$id
                );
            }

            // Delete all members of the workspace
            const members = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.equal('workspaceId', workspaceId)]
            );

            for (const member of members.documents) {
                await databases.deleteDocument(
                    DATABASE_ID,
                    MEMBERS_ID,
                    member.$id
                );
            }

            // Delete the workspace
            await databases.deleteDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId
            );

            return ctx.json({ data: { $id: workspaceId } })
        }
    )
    .post(
        '/:workspaceId/reset-invite-code',
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const { workspaceId } = ctx.req.param();

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member || member.role !== MemberRole.ADMIN) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const workspace = await databases.updateDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId,
                {
                    inviteCode: generateInviteCode(6)
                }
            );

            return ctx.json({ data: workspace })
        }
    )
export default app;