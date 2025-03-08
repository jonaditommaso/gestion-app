import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { createWorkspaceSchema } from '../schema';
import { sessionMiddleware } from '@/lib/session-middleware';
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from '@/config';
import { ID, Query } from 'node-appwrite';
import { MemberRole } from '../members/types';
import { generateInviteCode } from '@/lib/utils';
import { getMember } from '../members/utils';
import { z as zod} from 'zod';
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

            if(members.total === 0) {
                return ctx.json({ data: { documents: [], total: 0 } })
            }

            const workspacesIds = members.documents.map(member => member.workspaceId)

            const workspaces = await databases.listDocuments(
                DATABASE_ID,
                WORKSPACES_ID,
                [
                    Query.orderDesc('$createdAt'),
                    Query.contains('$id', workspacesIds)
                ]
            );

            return ctx.json({ data: workspaces })
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
                    userId: user.$id,
                    inviteCode: generateInviteCode(6)
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
        zValidator('form', createWorkspaceSchema),
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const { workspaceId } = ctx.req.param();
            const { name } = ctx.req.valid('form');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if(!member || member.role !== MemberRole.ADMIN) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const workspace = await databases.updateDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId,
                { name }
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

            if(workspace.inviteCode !== code) {
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

            if(!member || member.role !== MemberRole.ADMIN) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

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

            if(!member || member.role !== MemberRole.ADMIN) {
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