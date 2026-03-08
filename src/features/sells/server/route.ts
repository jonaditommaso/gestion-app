import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Models, Query } from "node-appwrite";
import {
    DATABASE_ID,
    DEALS_ID,
    DEAL_COMMENTS_ID,
    DEAL_ASSIGNEES_ID,
    DEAL_SELLERS_ID,
    DEAL_ACTIVITY_LOGS_ID,
} from "@/config";
import { getActiveContext } from "@/features/team/server/utils";
import {
    addDealActivitySchema,
    addDealAssigneeSchema,
    createDealSchema,
    createDealSellerSchema,
    updateDealSchema,
} from "../schemas";
import boardsApp from "./boards.route";

interface DealDocument extends Models.Document {
    title: string;
    description: string;
    company: string;
    companyResponsabileName: string;
    companyResponsabileEmail: string;
    companyResponsabilePhoneNumber: string;
    amount: number;
    currency: string;
    status: string;
    priority: number;
    expectedCloseDate: string | null;
    lastStageChangedAt: string | null;
    outcome: "PENDING" | "WON" | "LOST";
    nextStep: string;
    teamId: string;
    linkedDraftId: string | null;
}

interface DealCommentDocument extends Models.Document {
    dealId: string;
    authorMemberId: string;
    content: string;
    type: string | null;
}

interface DealSellerDocument extends Models.Document {
    memberId: string;
    teamId: string;
    name: string;
    email: string;
    avatarId: string | null;
}

interface DealAssigneeDocument extends Models.Document {
    dealId: string;
    memberId: string;
}

const app = new Hono()

    .route("/boards", boardsApp)

    // ── Sellers ─────────────────────────────────────────────────────────────────
    .get("/sellers", sessionMiddleware, async (ctx) => {
        const databases = ctx.get("databases");
        const user = ctx.get("user");

        const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
        if (!context) return ctx.json({ error: "No active organization" }, 400);

        const sellers = await databases.listDocuments<DealSellerDocument>(
            DATABASE_ID,
            DEAL_SELLERS_ID,
            [
                Query.equal("teamId", context.org.appwriteTeamId),
                Query.orderAsc("name"),
                Query.limit(200),
            ]
        );

        return ctx.json({ data: sellers });
    })

    .post(
        "/sellers",
        sessionMiddleware,
        zValidator("json", createDealSellerSchema),
        async (ctx) => {
            const databases = ctx.get("databases");
            const user = ctx.get("user");

            const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
            if (!context) return ctx.json({ error: "No active organization" }, 400);

            const { memberId, name, email, avatarId } = ctx.req.valid("json");

            const existing = await databases.listDocuments(
                DATABASE_ID,
                DEAL_SELLERS_ID,
                [
                    Query.equal("teamId", context.org.appwriteTeamId),
                    Query.equal("memberId", memberId),
                ]
            );

            if (existing.total > 0) {
                return ctx.json({ error: "Already a deal member" }, 409);
            }

            const seller = await databases.createDocument<DealSellerDocument>(
                DATABASE_ID,
                DEAL_SELLERS_ID,
                ID.unique(),
                {
                    memberId,
                    teamId: context.org.appwriteTeamId,
                    name,
                    email,
                    avatarId: avatarId ?? null,
                }
            );

            return ctx.json({ data: seller });
        }
    )

    .delete("/sellers/:sellerId", sessionMiddleware, async (ctx) => {
        const databases = ctx.get("databases");
        const user = ctx.get("user");
        const { sellerId } = ctx.req.param();

        const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
        if (!context) return ctx.json({ error: "No active organization" }, 400);

        const seller = await databases.getDocument<DealSellerDocument>(
            DATABASE_ID,
            DEAL_SELLERS_ID,
            sellerId
        );

        if (seller.teamId !== context.org.appwriteTeamId) {
            return ctx.json({ error: "Unauthorized" }, 401);
        }

        await databases.deleteDocument(DATABASE_ID, DEAL_SELLERS_ID, sellerId);

        return ctx.json({ data: { $id: sellerId } });
    })

    // ── Pipeline Health ──────────────────────────────────────────────────────────
    .get("/pipeline-health", sessionMiddleware, async (ctx) => {
        const databases = ctx.get("databases");
        const user = ctx.get("user");

        const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
        if (!context) {
            return ctx.json({ data: { leadsCount: 0, openDealsCount: 0, negotiationCount: 0, wonThisWeek: 0, totalByCurrency: [] } });
        }

        const dealsResult = await databases.listDocuments<DealDocument>(
            DATABASE_ID,
            DEALS_ID,
            [Query.equal("teamId", context.org.appwriteTeamId), Query.limit(1000)]
        );

        const deals = dealsResult.documents;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const leadsCount = deals.filter((d) => d.status === "LEADS").length;
        const negotiationCount = deals.filter((d) => d.status === "NEGOTIATION").length;
        const openDealsCount = deals.filter((d) => d.outcome === "PENDING").length;
        const wonThisWeek = deals.filter(
            (d) => d.outcome === "WON" && new Date(d.$updatedAt) >= sevenDaysAgo
        ).length;

        const stageCoefficients: Record<string, number> = {
            LEADS: 0.1,
            QUALIFICATION: 0.3,
            NEGOTIATION: 0.6,
            CLOSED: 0.9,
        };

        const pendingDeals = deals.filter((d) => d.outcome === "PENDING");
        const currencyMap: Record<string, { totalValue: number; weightedValue: number }> = {};

        for (const deal of pendingDeals) {
            if (!currencyMap[deal.currency]) {
                currencyMap[deal.currency] = { totalValue: 0, weightedValue: 0 };
            }
            currencyMap[deal.currency].totalValue += deal.amount;
            currencyMap[deal.currency].weightedValue +=
                deal.amount * (stageCoefficients[deal.status] ?? 0.1);
        }

        const totalByCurrency = Object.entries(currencyMap).map(([currency, values]) => ({
            currency,
            totalValue: Math.round(values.totalValue),
            weightedValue: Math.round(values.weightedValue),
        }));

        const wonThisWeekDeals = deals.filter(
            (d) => d.outcome === "WON" && new Date(d.$updatedAt) >= sevenDaysAgo
        );
        const wonCurrencyMap: Record<string, number> = {};
        for (const deal of wonThisWeekDeals) {
            wonCurrencyMap[deal.currency] = (wonCurrencyMap[deal.currency] ?? 0) + deal.amount;
        }
        const wonThisWeekByCurrency = Object.entries(wonCurrencyMap).map(([currency, totalValue]) => ({
            currency,
            totalValue: Math.round(totalValue),
        }));

        return ctx.json({ data: { leadsCount, openDealsCount, negotiationCount, wonThisWeek, totalByCurrency, wonThisWeekByCurrency } });
    })

    // ── Deals ────────────────────────────────────────────────────────────────────
    .get("/", sessionMiddleware, async (ctx) => {
        const databases = ctx.get("databases");
        const user = ctx.get("user");

        const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
        if (!context) return ctx.json({ error: "No active organization" }, 400);

        const dealsResult = await databases.listDocuments<DealDocument>(
            DATABASE_ID,
            DEALS_ID,
            [
                Query.equal("teamId", context.org.appwriteTeamId),
                Query.orderDesc("$createdAt"),
                Query.limit(500),
            ]
        );

        const dealIds = dealsResult.documents.map((d) => d.$id);

        // Batch-fetch assignees and comments for all deals
        const [assigneesResult, commentsResult] = await Promise.all([
            dealIds.length > 0
                ? databases.listDocuments<DealAssigneeDocument>(DATABASE_ID, DEAL_ASSIGNEES_ID, [
                    Query.equal("dealId", dealIds),
                    Query.limit(5000),
                ])
                : Promise.resolve({ documents: [] as DealAssigneeDocument[] }),
            dealIds.length > 0
                ? databases.listDocuments<DealCommentDocument>(DATABASE_ID, DEAL_COMMENTS_ID, [
                    Query.equal("dealId", dealIds),
                    Query.orderDesc("$createdAt"),
                    Query.limit(5000),
                ])
                : Promise.resolve({ documents: [] as DealCommentDocument[] }),
        ]);

        // Batch-fetch seller data for all assignees
        // deal-assignee.memberId stores the team membership $id
        // deal-sellers are keyed by their own memberId field (team membership $id)
        const memberIds = [...new Set(assigneesResult.documents.map((a) => a.memberId))];
        const sellersById: Record<string, DealSellerDocument> = {};

        if (memberIds.length > 0) {
            const sellersResult = await databases.listDocuments<DealSellerDocument>(
                DATABASE_ID,
                DEAL_SELLERS_ID,
                [Query.equal("memberId", memberIds), Query.limit(500)]
            );
            for (const s of sellersResult.documents) {
                sellersById[s.memberId] = s;
            }
        }

        // Group by dealId
        const assigneesByDealId: Record<string, DealAssigneeDocument[]> = {};
        for (const a of assigneesResult.documents) {
            if (!assigneesByDealId[a.dealId]) assigneesByDealId[a.dealId] = [];
            assigneesByDealId[a.dealId].push(a);
        }

        const commentsByDealId: Record<string, DealCommentDocument[]> = {};
        for (const c of commentsResult.documents) {
            if (!commentsByDealId[c.dealId]) commentsByDealId[c.dealId] = [];
            commentsByDealId[c.dealId].push(c);
        }

        const deals = dealsResult.documents.map((doc) => ({
            id: doc.$id,
            title: doc.title,
            description: doc.description,
            company: doc.company,
            contactId: doc.$id,
            companyResponsabileName: doc.companyResponsabileName,
            companyResponsabileEmail: doc.companyResponsabileEmail,
            companyResponsabilePhoneNumber: doc.companyResponsabilePhoneNumber,
            status: doc.status,
            amount: doc.amount,
            currency: doc.currency,
            priority: doc.priority,
            expectedCloseDate: doc.expectedCloseDate ? doc.expectedCloseDate.slice(0, 10) : null,
            lastStageChangedAt: doc.lastStageChangedAt ?? null,
            outcome: doc.outcome ?? "PENDING",
            nextStep: doc.nextStep,
            assignees: (assigneesByDealId[doc.$id] ?? []).map((a) => {
                const seller = sellersById[a.memberId];
                return {
                    id: a.$id,
                    memberId: seller?.$id ?? a.memberId,
                    name: seller?.name ?? "",
                    email: seller?.email ?? "",
                    avatarId: seller?.avatarId ?? null,
                };
            }),
            activities: (commentsByDealId[doc.$id] ?? []).map((c) => ({
                id: c.$id,
                content: c.content,
                author: c.authorMemberId,
                timestamp: c.$createdAt,
                type: c.type ?? undefined,
            })),
        }));

        return ctx.json({ data: { documents: deals, total: deals.length } });
    })

    .post(
        "/",
        sessionMiddleware,
        zValidator("json", createDealSchema),
        async (ctx) => {
            const databases = ctx.get("databases");
            const user = ctx.get("user");

            const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
            if (!context) return ctx.json({ error: "No active organization" }, 400);

            const { expectedCloseDate, ...rest } = ctx.req.valid("json");

            const doc = await databases.createDocument<DealDocument>(
                DATABASE_ID,
                DEALS_ID,
                ID.unique(),
                {
                    ...rest,
                    teamId: context.org.appwriteTeamId,
                    ...(expectedCloseDate ? { expectedCloseDate } : {}),
                }
            );

            const deal = {
                id: doc.$id,
                title: doc.title,
                description: doc.description,
                company: doc.company,
                contactId: doc.$id,
                companyResponsabileName: doc.companyResponsabileName,
                companyResponsabileEmail: doc.companyResponsabileEmail,
                companyResponsabilePhoneNumber: doc.companyResponsabilePhoneNumber,
                status: doc.status,
                amount: doc.amount,
                currency: doc.currency,
                priority: doc.priority,
                expectedCloseDate: doc.expectedCloseDate ? doc.expectedCloseDate.slice(0, 10) : null,
                lastStageChangedAt: null,
                outcome: doc.outcome ?? "PENDING",
                nextStep: doc.nextStep,
                assignees: [] as {
                    id: string;
                    memberId: string;
                    name: string;
                    email: string;
                    avatarId: string | null;
                }[],
                activities: [] as {
                    id: string;
                    content: string;
                    authorMemberId: string;
                    timestamp: string;
                    type: string | undefined;
                }[],
            };

            return ctx.json({ data: deal });
        }
    )

    .patch(
        "/:dealId",
        sessionMiddleware,
        zValidator("json", updateDealSchema),
        async (ctx) => {
            const databases = ctx.get("databases");
            const user = ctx.get("user");
            const { dealId } = ctx.req.param();

            const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
            if (!context) return ctx.json({ error: "No active organization" }, 400);

            const existing = await databases.getDocument<DealDocument>(
                DATABASE_ID,
                DEALS_ID,
                dealId
            );

            if (existing.teamId !== context.org.appwriteTeamId) {
                return ctx.json({ error: "Unauthorized" }, 401);
            }

            const body = ctx.req.valid("json");
            const updatePayload: Record<string, unknown> = { ...body };

            if (body.status !== undefined && body.status !== existing.status) {
                updatePayload.lastStageChangedAt = new Date().toISOString();
            }

            // Auto-create a draft billing operation when deal reaches CLOSED+WON
            const finalStatus = (body.status ?? existing.status) as string;
            const finalOutcome = (body.outcome ?? existing.outcome) as string;

            if (
                finalStatus === "CLOSED" &&
                finalOutcome === "WON" &&
                !existing.linkedDraftId
            ) {
                try {
                    const origin = new URL(ctx.req.raw.url).origin;
                    const billingResponse = await fetch(`${origin}/api/billing`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Cookie": ctx.req.raw.headers.get("cookie") ?? "",
                        },
                        body: JSON.stringify({
                            type: "income",
                            import: existing.amount,
                            currency: existing.currency,
                            category: existing.title,
                            partyName: existing.company,
                            date: new Date().toISOString(),
                            status: "PENDING",
                            isDraft: true,
                        }),
                    });

                    if (billingResponse.ok) {
                        const { data: draft } = await billingResponse.json() as { data: { $id: string } };
                        updatePayload.linkedDraftId = draft.$id;
                    } else {
                        console.error("Failed to create draft billing from deal:", await billingResponse.text());
                    }
                } catch (err) {
                    console.error("Failed to create draft billing from deal:", err);
                }
            }

            const doc = await databases.updateDocument<DealDocument>(
                DATABASE_ID,
                DEALS_ID,
                dealId,
                updatePayload
            );

            return ctx.json({ data: { $id: doc.$id, ...updatePayload } });
        }
    )

    .delete("/:dealId", sessionMiddleware, async (ctx) => {
        const databases = ctx.get("databases");
        const user = ctx.get("user");
        const { dealId } = ctx.req.param();

        const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
        if (!context) return ctx.json({ error: "No active organization" }, 400);

        const existing = await databases.getDocument<DealDocument>(
            DATABASE_ID,
            DEALS_ID,
            dealId
        );

        if (existing.teamId !== context.org.appwriteTeamId) {
            return ctx.json({ error: "Unauthorized" }, 401);
        }

        // Cascade: delete comments, assignees and activity logs for this deal
        const [comments, assignees, activityLogs] = await Promise.all([
            databases.listDocuments(DATABASE_ID, DEAL_COMMENTS_ID, [
                Query.equal("dealId", dealId),
                Query.limit(5000),
            ]),
            databases.listDocuments(DATABASE_ID, DEAL_ASSIGNEES_ID, [
                Query.equal("dealId", dealId),
                Query.limit(5000),
            ]),
            databases.listDocuments(DATABASE_ID, DEAL_ACTIVITY_LOGS_ID, [
                Query.equal("dealId", dealId),
                Query.limit(5000),
            ]),
        ]);

        await Promise.all([
            ...comments.documents.map((c) =>
                databases.deleteDocument(DATABASE_ID, DEAL_COMMENTS_ID, c.$id)
            ),
            ...assignees.documents.map((a) =>
                databases.deleteDocument(DATABASE_ID, DEAL_ASSIGNEES_ID, a.$id)
            ),
            ...activityLogs.documents.map((l) =>
                databases.deleteDocument(DATABASE_ID, DEAL_ACTIVITY_LOGS_ID, l.$id)
            ),
        ]);

        await databases.deleteDocument(DATABASE_ID, DEALS_ID, dealId);

        return ctx.json({ data: { $id: dealId } });
    })

    // ── Deal Assignees ───────────────────────────────────────────────────────────
    .get("/:dealId/assignees", sessionMiddleware, async (ctx) => {
        const databases = ctx.get("databases");
        const user = ctx.get("user");
        const { dealId } = ctx.req.param();

        const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
        if (!context) return ctx.json({ error: "No active organization" }, 400);

        const assignees = await databases.listDocuments<DealAssigneeDocument>(
            DATABASE_ID,
            DEAL_ASSIGNEES_ID,
            [Query.equal("dealId", dealId), Query.limit(100)]
        );

        const memberIds = assignees.documents.map((a) => a.memberId);
        const sellersById: Record<string, DealSellerDocument> = {};

        if (memberIds.length > 0) {
            const sellers = await databases.listDocuments<DealSellerDocument>(
                DATABASE_ID,
                DEAL_SELLERS_ID,
                [Query.equal("memberId", memberIds)]
            );
            for (const s of sellers.documents) {
                sellersById[s.memberId] = s;
            }
        }

        const result = assignees.documents.map((a) => {
            const seller = sellersById[a.memberId];
            return {
                id: a.$id,
                dealId: a.dealId,
                memberId: seller?.$id ?? a.memberId,
                name: seller?.name ?? "",
                email: seller?.email ?? "",
                avatarId: seller?.avatarId ?? null,
            };
        });

        return ctx.json({ data: { documents: result, total: result.length } });
    })

    .post(
        "/:dealId/assignees",
        sessionMiddleware,
        zValidator("json", addDealAssigneeSchema),
        async (ctx) => {
            const databases = ctx.get("databases");
            const user = ctx.get("user");
            const { dealId } = ctx.req.param();

            const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
            if (!context) return ctx.json({ error: "No active organization" }, 400);

            const deal = await databases.getDocument<DealDocument>(
                DATABASE_ID,
                DEALS_ID,
                dealId
            );

            if (deal.teamId !== context.org.appwriteTeamId) {
                return ctx.json({ error: "Unauthorized" }, 401);
            }

            const { memberId } = ctx.req.valid("json");

            const existing = await databases.listDocuments(DATABASE_ID, DEAL_ASSIGNEES_ID, [
                Query.equal("dealId", dealId),
                Query.equal("memberId", memberId),
            ]);

            if (existing.total > 0) {
                return ctx.json({ error: "Already assigned" }, 409);
            }

            const doc = await databases.createDocument<DealAssigneeDocument>(
                DATABASE_ID,
                DEAL_ASSIGNEES_ID,
                ID.unique(),
                { dealId, memberId }
            );

            return ctx.json({ data: doc });
        }
    )

    .delete("/:dealId/assignees/:assigneeId", sessionMiddleware, async (ctx) => {
        const databases = ctx.get("databases");
        const user = ctx.get("user");
        const { dealId, assigneeId } = ctx.req.param();

        const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
        if (!context) return ctx.json({ error: "No active organization" }, 400);

        const deal = await databases.getDocument<DealDocument>(
            DATABASE_ID,
            DEALS_ID,
            dealId
        );

        if (deal.teamId !== context.org.appwriteTeamId) {
            return ctx.json({ error: "Unauthorized" }, 401);
        }

        await databases.deleteDocument(DATABASE_ID, DEAL_ASSIGNEES_ID, assigneeId);

        return ctx.json({ data: { $id: assigneeId } });
    })

    // ── Deal Comments (Historial de actividad) ───────────────────────────────────
    .post(
        "/:dealId/comments",
        sessionMiddleware,
        zValidator("json", addDealActivitySchema),
        async (ctx) => {
            const databases = ctx.get("databases");
            const user = ctx.get("user");
            const { dealId } = ctx.req.param();

            const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
            if (!context) return ctx.json({ error: "No active organization" }, 400);

            const authorMemberId = context.membership.$id;

            const deal = await databases.getDocument<DealDocument>(
                DATABASE_ID,
                DEALS_ID,
                dealId
            );

            if (deal.teamId !== context.org.appwriteTeamId) {
                return ctx.json({ error: "Unauthorized" }, 401);
            }

            const { content, type } = ctx.req.valid("json");

            const doc = await databases.createDocument<DealCommentDocument>(
                DATABASE_ID,
                DEAL_COMMENTS_ID,
                ID.unique(),
                {
                    dealId,
                    teamId: context.org.appwriteTeamId,
                    authorMemberId,
                    content,
                    type: type ?? 'activity',
                }
            );

            return ctx.json({
                data: {
                    id: doc.$id,
                    author: doc.authorMemberId,
                    teamId: doc.teamId,
                    content: doc.content,
                    timestamp: doc.$createdAt,
                    type: doc.type ?? undefined,
                },
            });
        }
    );

export default app;
