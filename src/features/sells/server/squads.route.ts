import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Models, Query } from "node-appwrite";
import {
    DATABASE_ID,
    DEAL_SELLERS_ID,
    SELL_SQUADS_ID,
    SELL_SQUADS_MEMBERS_ID,
    SELL_SQUADS_ASSIGNEES_ID,
} from "@/config";
import { getActiveContext } from "@/features/team/server/utils";
import { createSellSquadSchema, updateSellSquadSchema } from "../schemas";
import { z as zod } from "zod";

interface SellerDocument extends Models.Document {
    memberId: string;
    teamId: string;
    name: string;
    email: string;
    avatarId: string | null;
}

interface SellSquadDocument extends Models.Document {
    teamId: string;
    name: string;
    leadSellerId: string | null;
    metadata: string | null;
}

interface SellSquadMemberDocument extends Models.Document {
    squadId: string;
    sellerId: string;
}

interface SellSquadAssigneeDocument extends Models.Document {
    squadId: string;
    dealId: string;
}

const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? "").toUpperCase();
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
};

const mapSellerDoc = (doc: SellerDocument) => ({
    id: doc.$id,
    memberId: doc.memberId,
    name: doc.name,
    initials: getInitials(doc.name),
    avatarId: doc.avatarId,
});

const app = new Hono()

    // GET /squads
    .get("/", sessionMiddleware, async (ctx) => {
        const user = ctx.get("user");
        const databases = ctx.get("databases");

        const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
        if (!context) return ctx.json({ error: "No active organization" }, 400);

        const squadsResult = await databases.listDocuments<SellSquadDocument>(
            DATABASE_ID,
            SELL_SQUADS_ID,
            [Query.equal("teamId", context.org.appwriteTeamId), Query.limit(500)]
        );

        if (squadsResult.documents.length === 0) {
            return ctx.json({ data: { ...squadsResult, documents: [] } });
        }

        const squadIds = squadsResult.documents.map((s) => s.$id);

        const membersResult = await databases.listDocuments<SellSquadMemberDocument>(
            DATABASE_ID,
            SELL_SQUADS_MEMBERS_ID,
            [Query.contains("squadId", squadIds), Query.limit(5000)]
        );

        const assigneesResult = await databases.listDocuments<SellSquadAssigneeDocument>(
            DATABASE_ID,
            SELL_SQUADS_ASSIGNEES_ID,
            [Query.contains("squadId", squadIds), Query.limit(5000)]
        );

        const sellerIds = [...new Set(membersResult.documents.map((m) => m.sellerId))];
        let allSellers: SellerDocument[] = [];
        if (sellerIds.length > 0) {
            const sellersResult = await databases.listDocuments<SellerDocument>(
                DATABASE_ID,
                DEAL_SELLERS_ID,
                [Query.contains("$id", sellerIds), Query.limit(500)]
            );
            allSellers = sellersResult.documents;
        }

        const populated = squadsResult.documents.map((squad) => {
            const squadMemberDocs = membersResult.documents.filter((m) => m.squadId === squad.$id);
            const members = squadMemberDocs
                .map((sm) => allSellers.find((s) => s.$id === sm.sellerId))
                .filter(Boolean)
                .map((s) => mapSellerDoc(s as SellerDocument));

            const leadSeller = squad.leadSellerId
                ? allSellers.find((s) => s.$id === squad.leadSellerId)
                : undefined;

            const dealIds = assigneesResult.documents
                .filter((a) => a.squadId === squad.$id)
                .map((a) => a.dealId);

            return {
                ...squad,
                members,
                leadSeller: leadSeller ? mapSellerDoc(leadSeller) : undefined,
                dealIds,
            };
        });

        return ctx.json({ data: { ...squadsResult, documents: populated } });
    })

    // POST /squads
    .post("/", sessionMiddleware, zValidator("json", createSellSquadSchema), async (ctx) => {
        const user = ctx.get("user");
        const databases = ctx.get("databases");

        const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
        if (!context) return ctx.json({ error: "No active organization" }, 400);

        const { name, leadSellerId, metadata } = ctx.req.valid("json");

        const squad = await databases.createDocument<SellSquadDocument>(
            DATABASE_ID,
            SELL_SQUADS_ID,
            ID.unique(),
            {
                name,
                teamId: context.org.appwriteTeamId,
                leadSellerId: leadSellerId ?? null,
                metadata: metadata ?? null,
            }
        );

        return ctx.json({ data: { ...squad, members: [], leadSeller: undefined, dealIds: [] } });
    })

    // PATCH /squads/:squadId
    .patch("/:squadId", sessionMiddleware, zValidator("json", updateSellSquadSchema), async (ctx) => {
        const user = ctx.get("user");
        const databases = ctx.get("databases");
        const { squadId } = ctx.req.param();
        const updates = ctx.req.valid("json");

        const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
        if (!context) return ctx.json({ error: "No active organization" }, 400);

        const squad = await databases.getDocument<SellSquadDocument>(DATABASE_ID, SELL_SQUADS_ID, squadId);
        if (squad.teamId !== context.org.appwriteTeamId) return ctx.json({ error: "Unauthorized" }, 401);

        const updated = await databases.updateDocument<SellSquadDocument>(
            DATABASE_ID,
            SELL_SQUADS_ID,
            squadId,
            {
                ...(updates.name !== undefined ? { name: updates.name } : {}),
                ...("leadSellerId" in updates ? { leadSellerId: updates.leadSellerId ?? null } : {}),
                ...("metadata" in updates ? { metadata: updates.metadata ?? null } : {}),
            }
        );

        const membersResult = await databases.listDocuments<SellSquadMemberDocument>(
            DATABASE_ID,
            SELL_SQUADS_MEMBERS_ID,
            [Query.equal("squadId", squadId), Query.limit(500)]
        );
        const sellerIds = membersResult.documents.map((m) => m.sellerId);
        let allSellers: SellerDocument[] = [];
        if (sellerIds.length > 0) {
            const r = await databases.listDocuments<SellerDocument>(DATABASE_ID, DEAL_SELLERS_ID, [
                Query.contains("$id", sellerIds),
                Query.limit(500),
            ]);
            allSellers = r.documents;
        }

        const members = allSellers.map(mapSellerDoc);
        const leadSeller = updated.leadSellerId
            ? allSellers.find((s) => s.$id === updated.leadSellerId)
            : undefined;

        const assigneesResult = await databases.listDocuments<SellSquadAssigneeDocument>(
            DATABASE_ID,
            SELL_SQUADS_ASSIGNEES_ID,
            [Query.equal("squadId", squadId), Query.limit(5000)]
        );
        const dealIds = assigneesResult.documents.map((a) => a.dealId);

        return ctx.json({
            data: {
                ...updated,
                members,
                leadSeller: leadSeller ? mapSellerDoc(leadSeller) : undefined,
                dealIds,
            },
        });
    })

    // DELETE /squads/:squadId
    .delete("/:squadId", sessionMiddleware, async (ctx) => {
        const user = ctx.get("user");
        const databases = ctx.get("databases");
        const { squadId } = ctx.req.param();

        const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
        if (!context) return ctx.json({ error: "No active organization" }, 400);

        const squad = await databases.getDocument<SellSquadDocument>(DATABASE_ID, SELL_SQUADS_ID, squadId);
        if (squad.teamId !== context.org.appwriteTeamId) return ctx.json({ error: "Unauthorized" }, 401);

        const squadMembers = await databases.listDocuments(DATABASE_ID, SELL_SQUADS_MEMBERS_ID, [
            Query.equal("squadId", squadId),
            Query.limit(5000),
        ]);
        for (const sm of squadMembers.documents) {
            await databases.deleteDocument(DATABASE_ID, SELL_SQUADS_MEMBERS_ID, sm.$id);
        }

        const assignees = await databases.listDocuments(DATABASE_ID, SELL_SQUADS_ASSIGNEES_ID, [
            Query.equal("squadId", squadId),
            Query.limit(5000),
        ]);
        for (const a of assignees.documents) {
            await databases.deleteDocument(DATABASE_ID, SELL_SQUADS_ASSIGNEES_ID, a.$id);
        }

        await databases.deleteDocument(DATABASE_ID, SELL_SQUADS_ID, squadId);

        return ctx.json({ data: { $id: squadId } });
    })

    // POST /squads/:squadId/members  { sellerId }
    .post(
        "/:squadId/members",
        sessionMiddleware,
        zValidator("json", zod.object({ sellerId: zod.string().min(1) })),
        async (ctx) => {
            const user = ctx.get("user");
            const databases = ctx.get("databases");
            const { squadId } = ctx.req.param();
            const { sellerId } = ctx.req.valid("json");

            const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
            if (!context) return ctx.json({ error: "No active organization" }, 400);

            const squad = await databases.getDocument<SellSquadDocument>(DATABASE_ID, SELL_SQUADS_ID, squadId);
            if (squad.teamId !== context.org.appwriteTeamId) return ctx.json({ error: "Unauthorized" }, 401);

            const existing = await databases.listDocuments(DATABASE_ID, SELL_SQUADS_MEMBERS_ID, [
                Query.equal("squadId", squadId),
                Query.equal("sellerId", sellerId),
            ]);
            if (existing.documents.length > 0) {
                return ctx.json({ error: "Seller already in squad" }, 400);
            }

            await databases.createDocument(DATABASE_ID, SELL_SQUADS_MEMBERS_ID, ID.unique(), {
                squadId,
                sellerId,
            });

            const membersResult = await databases.listDocuments<SellSquadMemberDocument>(
                DATABASE_ID,
                SELL_SQUADS_MEMBERS_ID,
                [Query.equal("squadId", squadId), Query.limit(500)]
            );
            const sellerIds = membersResult.documents.map((m) => m.sellerId);
            let allSellers: SellerDocument[] = [];
            if (sellerIds.length > 0) {
                const r = await databases.listDocuments<SellerDocument>(DATABASE_ID, DEAL_SELLERS_ID, [
                    Query.contains("$id", sellerIds),
                    Query.limit(500),
                ]);
                allSellers = r.documents;
            }

            const members = allSellers.map(mapSellerDoc);
            const leadSeller = squad.leadSellerId
                ? allSellers.find((s) => s.$id === squad.leadSellerId)
                : undefined;

            return ctx.json({
                data: {
                    ...squad,
                    members,
                    leadSeller: leadSeller ? mapSellerDoc(leadSeller) : undefined,
                    dealIds: [],
                },
            });
        }
    )

    // DELETE /squads/:squadId/members/:sellerId
    .delete("/:squadId/members/:sellerId", sessionMiddleware, async (ctx) => {
        const user = ctx.get("user");
        const databases = ctx.get("databases");
        const { squadId, sellerId } = ctx.req.param();

        const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
        if (!context) return ctx.json({ error: "No active organization" }, 400);

        const squad = await databases.getDocument<SellSquadDocument>(DATABASE_ID, SELL_SQUADS_ID, squadId);
        if (squad.teamId !== context.org.appwriteTeamId) return ctx.json({ error: "Unauthorized" }, 401);

        const existing = await databases.listDocuments(DATABASE_ID, SELL_SQUADS_MEMBERS_ID, [
            Query.equal("squadId", squadId),
            Query.equal("sellerId", sellerId),
        ]);
        if (existing.documents.length === 0) {
            return ctx.json({ error: "Seller not in squad" }, 404);
        }

        await databases.deleteDocument(DATABASE_ID, SELL_SQUADS_MEMBERS_ID, existing.documents[0].$id);

        const membersResult = await databases.listDocuments<SellSquadMemberDocument>(
            DATABASE_ID,
            SELL_SQUADS_MEMBERS_ID,
            [Query.equal("squadId", squadId), Query.limit(500)]
        );
        const sellerIds = membersResult.documents.map((m) => m.sellerId);
        let allSellers: SellerDocument[] = [];
        if (sellerIds.length > 0) {
            const r = await databases.listDocuments<SellerDocument>(DATABASE_ID, DEAL_SELLERS_ID, [
                Query.contains("$id", sellerIds),
                Query.limit(500),
            ]);
            allSellers = r.documents;
        }

        let updatedSquad = squad;
        if (squad.leadSellerId === sellerId) {
            updatedSquad = await databases.updateDocument<SellSquadDocument>(
                DATABASE_ID,
                SELL_SQUADS_ID,
                squadId,
                { leadSellerId: null }
            );
        }

        const members = allSellers.map(mapSellerDoc);
        const leadSeller = updatedSquad.leadSellerId
            ? allSellers.find((s) => s.$id === updatedSquad.leadSellerId)
            : undefined;

        return ctx.json({
            data: {
                ...updatedSquad,
                members,
                leadSeller: leadSeller ? mapSellerDoc(leadSeller) : undefined,
                dealIds: [],
            },
        });
    })

    // POST /squads/:squadId/deals/:dealId — Assign squad to deal
    .post("/:squadId/deals/:dealId", sessionMiddleware, async (ctx) => {
        const user = ctx.get("user");
        const databases = ctx.get("databases");
        const { squadId, dealId } = ctx.req.param();

        const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
        if (!context) return ctx.json({ error: "No active organization" }, 400);

        const squad = await databases.getDocument<SellSquadDocument>(DATABASE_ID, SELL_SQUADS_ID, squadId);
        if (squad.teamId !== context.org.appwriteTeamId) return ctx.json({ error: "Unauthorized" }, 401);

        const existing = await databases.listDocuments(DATABASE_ID, SELL_SQUADS_ASSIGNEES_ID, [
            Query.equal("squadId", squadId),
            Query.equal("dealId", dealId),
        ]);
        if (existing.documents.length > 0) {
            return ctx.json({ error: "Squad already assigned to deal" }, 400);
        }

        await databases.createDocument(DATABASE_ID, SELL_SQUADS_ASSIGNEES_ID, ID.unique(), {
            squadId,
            dealId,
        });

        return ctx.json({ data: { squadId, dealId } });
    })

    // DELETE /squads/:squadId/deals/:dealId — Unassign squad from deal
    .delete("/:squadId/deals/:dealId", sessionMiddleware, async (ctx) => {
        const user = ctx.get("user");
        const databases = ctx.get("databases");
        const { squadId, dealId } = ctx.req.param();

        const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
        if (!context) return ctx.json({ error: "No active organization" }, 400);

        const squad = await databases.getDocument<SellSquadDocument>(DATABASE_ID, SELL_SQUADS_ID, squadId);
        if (squad.teamId !== context.org.appwriteTeamId) return ctx.json({ error: "Unauthorized" }, 401);

        const existing = await databases.listDocuments(DATABASE_ID, SELL_SQUADS_ASSIGNEES_ID, [
            Query.equal("squadId", squadId),
            Query.equal("dealId", dealId),
        ]);
        if (existing.documents.length === 0) {
            return ctx.json({ error: "Assignment not found" }, 404);
        }

        await databases.deleteDocument(DATABASE_ID, SELL_SQUADS_ASSIGNEES_ID, existing.documents[0].$id);

        return ctx.json({ data: { squadId, dealId } });
    });

export default app;
