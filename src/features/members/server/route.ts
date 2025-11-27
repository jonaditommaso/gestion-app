import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { MemberRole } from "@/features/workspaces/members/types";
import { getMember } from "@/features/workspaces/members/utils";
import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { z as zod } from 'zod';


const app = new Hono()

    .get(
        '/',
        sessionMiddleware,
        zValidator('query', zod.object({ workspaceId: zod.string() })),
        async ctx => {
            const { users } = await createAdminClient();

            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const { workspaceId } = ctx.req.valid('query');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const members = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [
                    Query.equal('workspaceId', workspaceId)
                ]
            );

            const populatedMembers = await Promise.all(
                members.documents.map(async member => {
                    const user = await users.get(member.userId);

                    return {
                        ...member,
                        name: user.name,
                        email: user.email
                    }
                })
            )

            return ctx.json({
                data: {
                    ...members,
                    documents: populatedMembers
                }
            })
        }
    )

    .post(
        '/',
        sessionMiddleware,
        zValidator('json', zod.object({
            workspaceId: zod.string(),
            userIds: zod.array(zod.string()).min(1),
            members: zod.array(zod.object({
                userId: zod.string(),
                name: zod.string(),
                email: zod.string().email(),
                avatarId: zod.string().optional().nullable()
            })).min(1)
        })),
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const { workspaceId, members } = ctx.req.valid('json');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member || member.role !== MemberRole.ADMIN) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const createdMembers = await Promise.all(
                members.map(async (memberData) => {
                    // Verificar si ya es miembro
                    const existingMember = await databases.listDocuments(
                        DATABASE_ID,
                        MEMBERS_ID,
                        [
                            Query.equal('workspaceId', workspaceId),
                            Query.equal('userId', memberData.userId)
                        ]
                    );

                    if (existingMember.total > 0) {
                        return null; // Ya es miembro, saltarlo
                    }

                    return await databases.createDocument(
                        DATABASE_ID,
                        MEMBERS_ID,
                        ID.unique(),
                        {
                            userId: memberData.userId,
                            workspaceId,
                            role: MemberRole.MEMBER,
                            name: memberData.name,
                            email: memberData.email,
                            avatarId: memberData.avatarId || null
                        }
                    );
                })
            );

            const validMembers = createdMembers.filter(m => m !== null);

            return ctx.json({
                data: validMembers,
                added: validMembers.length
            })
        }
    )

    .get(
        '/current',
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const members = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [
                    Query.equal('userId', user.$id),
                ]
            );

            const member = members.documents[0];

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            return ctx.json({
                data: member
            })
        }
    )

    .delete(
        '/:memberId',
        sessionMiddleware,
        async ctx => {
            const { memberId } = ctx.req.param();

            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const memberToDelete = await databases.getDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId
            );

            const allMembersInWorkspace = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [
                    Query.equal('workspaceId', memberToDelete.workspaceId)
                ]
            );

            const member = await getMember({
                databases,
                workspaceId: memberToDelete.workspaceId,
                userId: user.$id
            })

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            if (member.$id !== memberToDelete.$id && member.role !== MemberRole.ADMIN) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            if (allMembersInWorkspace.total === 1) {
                return ctx.json({ error: 'Cannot delete the only member' }, 400)
            }

            await databases.deleteDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId,
            )

            return ctx.json({ data: { $id: memberToDelete.$id } })
        }
    )

    .patch(
        '/:memberId',
        sessionMiddleware,
        zValidator('json', zod.object({ role: zod.nativeEnum(MemberRole) })),
        async ctx => {
            const { memberId } = ctx.req.param();
            const { role } = ctx.req.valid('json')

            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const memberToUpdate = await databases.getDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId
            );

            const allMembersInWorkspace = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [
                    Query.equal('workspaceId', memberToUpdate.workspaceId)
                ]
            );

            const member = await getMember({
                databases,
                workspaceId: memberToUpdate.workspaceId,
                userId: user.$id
            })

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            if (member.$id !== memberToUpdate.$id && member.role !== MemberRole.ADMIN) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            if (allMembersInWorkspace.total === 1) {
                return ctx.json({ error: 'Cannot downgrade the only member' }, 400)
            }

            await databases.updateDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId,
                {
                    role
                }
            )

            return ctx.json({ data: { $id: memberToUpdate.$id } })
        }
    )

export default app;