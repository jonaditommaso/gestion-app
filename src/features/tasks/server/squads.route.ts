import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createSquadSchema, updateSquadSchema } from "../schemas";
import { getMember } from "@/features/workspaces/members/utils";
import { DATABASE_ID, MEMBERS_ID, TASK_SQUADS_ASSIGNEES_ID, TASK_SQUADS_ID, TASK_SQUADS_MEMBERS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { TaskSquad, TaskSquadAssignee, TaskSquadMember, WorkspaceMember } from "../types";
import { z as zod } from 'zod';

const app = new Hono()

    // GET /squads?workspaceId=...
    .get(
        '/',
        sessionMiddleware,
        zValidator('query', zod.object({ workspaceId: zod.string() })),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { workspaceId } = ctx.req.valid('query');

            const member = await getMember({ databases, workspaceId, userId: user.$id });
            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            const squadsResult = await databases.listDocuments<TaskSquad>(
                DATABASE_ID,
                TASK_SQUADS_ID,
                [Query.equal('workspaceId', workspaceId), Query.limit(500)]
            );

            if (squadsResult.documents.length === 0) {
                return ctx.json({ data: { ...squadsResult, documents: [] } });
            }

            // Populate members for each squad
            const squadIds = squadsResult.documents.map(s => s.$id);

            const squadMembersResult = await databases.listDocuments<TaskSquadMember>(
                DATABASE_ID,
                TASK_SQUADS_MEMBERS_ID,
                [Query.contains('squadId', squadIds), Query.limit(5000)]
            );

            const memberIds = [...new Set(squadMembersResult.documents.map(sm => sm.memberId))];

            let allMembers: WorkspaceMember[] = [];
            if (memberIds.length > 0) {
                const membersResult = await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', memberIds), Query.limit(500)]
                );
                allMembers = membersResult.documents;
            }

            const populatedSquads = squadsResult.documents.map(squad => {
                const squadMemberDocs = squadMembersResult.documents.filter(sm => sm.squadId === squad.$id);
                const members = squadMemberDocs
                    .map(sm => allMembers.find(m => m.$id === sm.memberId))
                    .filter(Boolean) as WorkspaceMember[];
                const leadMember = squad.leadMemberId
                    ? allMembers.find(m => m.$id === squad.leadMemberId)
                    : undefined;
                return { ...squad, members, leadMember };
            });

            return ctx.json({ data: { ...squadsResult, documents: populatedSquads } });
        }
    )

    // POST /squads
    .post(
        '/',
        sessionMiddleware,
        zValidator('json', createSquadSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { name, workspaceId, leadMemberId, metadata } = ctx.req.valid('json');

            const member = await getMember({ databases, workspaceId, userId: user.$id });
            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            const squad = await databases.createDocument<TaskSquad>(
                DATABASE_ID,
                TASK_SQUADS_ID,
                ID.unique(),
                {
                    name,
                    workspaceId,
                    createdByMemberId: member.$id,
                    leadMemberId: leadMemberId || null,
                    metadata: metadata ?? null,
                }
            );

            return ctx.json({ data: { ...squad, members: [], leadMember: undefined } });
        }
    )

    // PATCH /squads/:squadId
    .patch(
        '/:squadId',
        sessionMiddleware,
        zValidator('json', updateSquadSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { squadId } = ctx.req.param();
            const updates = ctx.req.valid('json');

            const squad = await databases.getDocument<TaskSquad>(DATABASE_ID, TASK_SQUADS_ID, squadId);

            const member = await getMember({ databases, workspaceId: squad.workspaceId, userId: user.$id });
            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            const updated = await databases.updateDocument<TaskSquad>(
                DATABASE_ID,
                TASK_SQUADS_ID,
                squadId,
                {
                    ...(updates.name !== undefined ? { name: updates.name } : {}),
                    ...('leadMemberId' in updates ? { leadMemberId: updates.leadMemberId || null } : {}),
                    ...('metadata' in updates ? { metadata: updates.metadata ?? null } : {}),
                }
            );

            // Populate members
            const squadMembersResult = await databases.listDocuments<TaskSquadMember>(
                DATABASE_ID,
                TASK_SQUADS_MEMBERS_ID,
                [Query.equal('squadId', squadId), Query.limit(500)]
            );

            const memberIds = squadMembersResult.documents.map(sm => sm.memberId);
            let allMembers: WorkspaceMember[] = [];
            if (memberIds.length > 0) {
                const membersResult = await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', memberIds), Query.limit(500)]
                );
                allMembers = membersResult.documents;
            }

            const leadMember = updated.leadMemberId
                ? allMembers.find(m => m.$id === updated.leadMemberId)
                : undefined;

            return ctx.json({ data: { ...updated, members: allMembers, leadMember } });
        }
    )

    // DELETE /squads/:squadId
    .delete(
        '/:squadId',
        sessionMiddleware,
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { squadId } = ctx.req.param();

            const squad = await databases.getDocument<TaskSquad>(DATABASE_ID, TASK_SQUADS_ID, squadId);

            const member = await getMember({ databases, workspaceId: squad.workspaceId, userId: user.$id });
            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Delete all squad members
            const squadMembers = await databases.listDocuments(
                DATABASE_ID,
                TASK_SQUADS_MEMBERS_ID,
                [Query.equal('squadId', squadId), Query.limit(5000)]
            );
            for (const sm of squadMembers.documents) {
                await databases.deleteDocument(DATABASE_ID, TASK_SQUADS_MEMBERS_ID, sm.$id);
            }

            // Delete all squad task assignments
            const squadAssignees = await databases.listDocuments(
                DATABASE_ID,
                TASK_SQUADS_ASSIGNEES_ID,
                [Query.equal('squadId', squadId), Query.limit(5000)]
            );
            for (const sa of squadAssignees.documents) {
                await databases.deleteDocument(DATABASE_ID, TASK_SQUADS_ASSIGNEES_ID, sa.$id);
            }

            await databases.deleteDocument(DATABASE_ID, TASK_SQUADS_ID, squadId);

            return ctx.json({ data: { $id: squadId } });
        }
    )

    // POST /squads/:squadId/members  { memberId }
    .post(
        '/:squadId/members',
        sessionMiddleware,
        zValidator('json', zod.object({ memberId: zod.string().min(1) })),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { squadId } = ctx.req.param();
            const { memberId } = ctx.req.valid('json');

            const squad = await databases.getDocument<TaskSquad>(DATABASE_ID, TASK_SQUADS_ID, squadId);

            const member = await getMember({ databases, workspaceId: squad.workspaceId, userId: user.$id });
            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Check if already a member
            const existing = await databases.listDocuments<TaskSquadMember>(
                DATABASE_ID,
                TASK_SQUADS_MEMBERS_ID,
                [Query.equal('squadId', squadId), Query.equal('memberId', memberId)]
            );
            if (existing.documents.length > 0) {
                return ctx.json({ error: 'Member already in squad' }, 400);
            }

            await databases.createDocument<TaskSquadMember>(
                DATABASE_ID,
                TASK_SQUADS_MEMBERS_ID,
                ID.unique(),
                { squadId, memberId }
            );

            // Return updated squad with members
            const allSquadMembers = await databases.listDocuments<TaskSquadMember>(
                DATABASE_ID,
                TASK_SQUADS_MEMBERS_ID,
                [Query.equal('squadId', squadId), Query.limit(500)]
            );
            const memberIds = allSquadMembers.documents.map(sm => sm.memberId);
            let allMembers: WorkspaceMember[] = [];
            if (memberIds.length > 0) {
                const membersResult = await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', memberIds), Query.limit(500)]
                );
                allMembers = membersResult.documents;
            }

            const leadMember = squad.leadMemberId
                ? allMembers.find(m => m.$id === squad.leadMemberId)
                : undefined;

            return ctx.json({ data: { ...squad, members: allMembers, leadMember } });
        }
    )

    // DELETE /squads/:squadId/members/:memberId
    .delete(
        '/:squadId/members/:memberId',
        sessionMiddleware,
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { squadId, memberId } = ctx.req.param();

            const squad = await databases.getDocument<TaskSquad>(DATABASE_ID, TASK_SQUADS_ID, squadId);

            const member = await getMember({ databases, workspaceId: squad.workspaceId, userId: user.$id });
            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            const existing = await databases.listDocuments<TaskSquadMember>(
                DATABASE_ID,
                TASK_SQUADS_MEMBERS_ID,
                [Query.equal('squadId', squadId), Query.equal('memberId', memberId)]
            );
            if (existing.documents.length === 0) {
                return ctx.json({ error: 'Member not in squad' }, 404);
            }

            await databases.deleteDocument(DATABASE_ID, TASK_SQUADS_MEMBERS_ID, existing.documents[0].$id);

            // Return updated squad
            const allSquadMembers = await databases.listDocuments<TaskSquadMember>(
                DATABASE_ID,
                TASK_SQUADS_MEMBERS_ID,
                [Query.equal('squadId', squadId), Query.limit(500)]
            );
            const memberIds = allSquadMembers.documents.map(sm => sm.memberId);
            let allMembers: WorkspaceMember[] = [];
            if (memberIds.length > 0) {
                const membersResult = await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', memberIds), Query.limit(500)]
                );
                allMembers = membersResult.documents;
            }

            // If removed member was the lead, clear lead
            let updatedSquad = squad;
            if (squad.leadMemberId === memberId) {
                updatedSquad = await databases.updateDocument<TaskSquad>(
                    DATABASE_ID,
                    TASK_SQUADS_ID,
                    squadId,
                    { leadMemberId: null }
                );
            }

            const leadMember = updatedSquad.leadMemberId
                ? allMembers.find(m => m.$id === updatedSquad.leadMemberId)
                : undefined;

            return ctx.json({ data: { ...updatedSquad, members: allMembers, leadMember } });
        }
    )

    // POST /squads/:squadId/tasks/:taskId  — Assign squad to task
    .post(
        '/:squadId/tasks/:taskId',
        sessionMiddleware,
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { squadId, taskId } = ctx.req.param();

            const squad = await databases.getDocument<TaskSquad>(DATABASE_ID, TASK_SQUADS_ID, squadId);

            const member = await getMember({ databases, workspaceId: squad.workspaceId, userId: user.$id });
            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Check if already assigned
            const existing = await databases.listDocuments<TaskSquadAssignee>(
                DATABASE_ID,
                TASK_SQUADS_ASSIGNEES_ID,
                [Query.equal('squadId', squadId), Query.equal('taskId', taskId)]
            );
            if (existing.documents.length > 0) {
                return ctx.json({ error: 'Squad already assigned to task' }, 400);
            }

            await databases.createDocument<TaskSquadAssignee>(
                DATABASE_ID,
                TASK_SQUADS_ASSIGNEES_ID,
                ID.unique(),
                { squadId, taskId }
            );

            return ctx.json({ data: { squadId, taskId } });
        }
    )

    // DELETE /squads/:squadId/tasks/:taskId  — Unassign squad from task
    .delete(
        '/:squadId/tasks/:taskId',
        sessionMiddleware,
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { squadId, taskId } = ctx.req.param();

            const squad = await databases.getDocument<TaskSquad>(DATABASE_ID, TASK_SQUADS_ID, squadId);

            const member = await getMember({ databases, workspaceId: squad.workspaceId, userId: user.$id });
            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            const existing = await databases.listDocuments<TaskSquadAssignee>(
                DATABASE_ID,
                TASK_SQUADS_ASSIGNEES_ID,
                [Query.equal('squadId', squadId), Query.equal('taskId', taskId)]
            );
            if (existing.documents.length === 0) {
                return ctx.json({ error: 'Assignment not found' }, 404);
            }

            await databases.deleteDocument(DATABASE_ID, TASK_SQUADS_ASSIGNEES_ID, existing.documents[0].$id);

            return ctx.json({ data: { squadId, taskId } });
        }
    )

export default app;
