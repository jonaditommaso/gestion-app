import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Models, Query } from "node-appwrite";
import {
    DATABASE_ID,
    DEALS_ID,
    SALES_BOARDS_ID,
    SALES_GOALS_ID,
} from "@/config";
import { getActiveContext } from "@/features/team/server/utils";
import {
    createSalesBoardSchema,
    createSalesGoalSchema,
    updateSalesBoardSchema,
} from "../schemas";

interface SalesBoardDocument extends Models.Document {
    teamId: string;
    name: string;
    currencies: string; // stored as comma-separated string in Appwrite
    activeGoalId: string | null;
}

const parseCurrencies = (raw: string): string[] =>
    raw ? raw.split(',').filter(Boolean) : [];

interface SalesGoalDocument extends Models.Document {
    boardId: string;
    period: string;
    targetAmount: number;
    targetReached: number;
    currency: string;
    totalDeals: number;
    totalDealsWon: number;
}

interface DealDocument extends Models.Document {
    teamId: string;
    status: string;
    currency: string;
    amount: number;
}

const app = new Hono()

    // ── Boards ───────────────────────────────────────────────────────────────────
    .get("/", sessionMiddleware, async (ctx) => {
        const databases = ctx.get("databases");
        const user = ctx.get("user");

        const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
        if (!context) return ctx.json({ error: "No active organization" }, 400);

        const result = await databases.listDocuments<SalesBoardDocument>(
            DATABASE_ID,
            SALES_BOARDS_ID,
            [
                Query.equal("teamId", context.org.appwriteTeamId),
                Query.orderAsc("name"),
                Query.limit(100),
            ]
        );

        const boards = result.documents.map((doc) => ({
            id: doc.$id,
            teamId: doc.teamId,
            name: doc.name,
            currencies: parseCurrencies(doc.currencies),
            activeGoalId: doc.activeGoalId ?? null,
            createdAt: doc.$createdAt,
        }));

        return ctx.json({ data: { documents: boards, total: boards.length } });
    })

    .post(
        "/",
        sessionMiddleware,
        zValidator("json", createSalesBoardSchema),
        async (ctx) => {
            const databases = ctx.get("databases");
            const user = ctx.get("user");

            const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
            if (!context) return ctx.json({ error: "No active organization" }, 400);

            const { name, currencies } = ctx.req.valid("json");

            const doc = await databases.createDocument<SalesBoardDocument>(
                DATABASE_ID,
                SALES_BOARDS_ID,
                ID.unique(),
                {
                    teamId: context.org.appwriteTeamId,
                    name,
                    currencies: currencies.join(','),
                    activeGoalId: null,
                }
            );

            return ctx.json({
                data: {
                    id: doc.$id,
                    teamId: doc.teamId,
                    name: doc.name,
                    currencies: parseCurrencies(doc.currencies),
                    activeGoalId: null,
                    createdAt: doc.$createdAt,
                },
            });
        }
    )

    .patch(
        "/:boardId",
        sessionMiddleware,
        zValidator("json", updateSalesBoardSchema),
        async (ctx) => {
            const databases = ctx.get("databases");
            const user = ctx.get("user");
            const { boardId } = ctx.req.param();

            const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
            if (!context) return ctx.json({ error: "No active organization" }, 400);

            const existing = await databases.getDocument<SalesBoardDocument>(
                DATABASE_ID,
                SALES_BOARDS_ID,
                boardId
            );

            if (existing.teamId !== context.org.appwriteTeamId) {
                return ctx.json({ error: "Unauthorized" }, 401);
            }

            const body = ctx.req.valid("json");
            const updateData: Record<string, unknown> = { ...body };
            if (body.currencies !== undefined) {
                updateData.currencies = body.currencies.join(',');
            }

            const doc = await databases.updateDocument<SalesBoardDocument>(
                DATABASE_ID,
                SALES_BOARDS_ID,
                boardId,
                updateData
            );

            return ctx.json({
                data: {
                    id: doc.$id,
                    teamId: doc.teamId,
                    name: doc.name,
                    currencies: parseCurrencies(doc.currencies),
                    activeGoalId: doc.activeGoalId ?? null,
                    createdAt: doc.$createdAt,
                },
            });
        }
    )

    // ── Goals ────────────────────────────────────────────────────────────────────
    .get("/:boardId/goals", sessionMiddleware, async (ctx) => {
        const databases = ctx.get("databases");
        const user = ctx.get("user");
        const { boardId } = ctx.req.param();

        const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
        if (!context) return ctx.json({ error: "No active organization" }, 400);

        // Verify board ownership
        const board = await databases.getDocument<SalesBoardDocument>(
            DATABASE_ID,
            SALES_BOARDS_ID,
            boardId
        );

        if (board.teamId !== context.org.appwriteTeamId) {
            return ctx.json({ error: "Unauthorized" }, 401);
        }

        const result = await databases.listDocuments<SalesGoalDocument>(
            DATABASE_ID,
            SALES_GOALS_ID,
            [
                Query.equal("boardId", boardId),
                Query.orderDesc("period"),
                Query.limit(200),
            ]
        );

        const goals = result.documents.map((doc) => ({
            id: doc.$id,
            boardId: doc.boardId,
            period: doc.period,
            targetAmount: doc.targetAmount,
            targetReached: doc.targetReached > 0,
            currency: doc.currency,
            totalDeals: doc.totalDeals,
            totalDealsWon: doc.totalDealsWon,
        }));

        return ctx.json({ data: { documents: goals, total: goals.length } });
    })

    .post(
        "/:boardId/goals",
        sessionMiddleware,
        zValidator("json", createSalesGoalSchema),
        async (ctx) => {
            const databases = ctx.get("databases");
            const user = ctx.get("user");
            const { boardId } = ctx.req.param();

            const context = await getActiveContext(user, databases, ctx.get("activeOrgId"));
            if (!context) return ctx.json({ error: "No active organization" }, 400);

            const board = await databases.getDocument<SalesBoardDocument>(
                DATABASE_ID,
                SALES_BOARDS_ID,
                boardId
            );

            if (board.teamId !== context.org.appwriteTeamId) {
                return ctx.json({ error: "Unauthorized" }, 401);
            }

            const { targetAmount, currency, period } = ctx.req.valid("json");

            const [allDealsInCurrency, wonDealsInCurrency] = await Promise.all([
                databases.listDocuments<DealDocument>(
                    DATABASE_ID,
                    DEALS_ID,
                    [
                        Query.equal("teamId", context.org.appwriteTeamId),
                        Query.equal("currency", currency),
                        Query.limit(5000),
                    ]
                ),
                databases.listDocuments<DealDocument>(
                    DATABASE_ID,
                    DEALS_ID,
                    [
                        Query.equal("teamId", context.org.appwriteTeamId),
                        Query.equal("currency", currency),
                        Query.equal("status", "CLOSED"),
                        Query.limit(5000),
                    ]
                ),
            ]);

            const wonAmount = wonDealsInCurrency.documents.reduce(
                (acc, deal) => acc + (deal.amount ?? 0),
                0
            );
            const targetReached = wonAmount >= targetAmount ? 1 : 0;
            const totalDeals = allDealsInCurrency.total;
            const totalDealsWon = wonDealsInCurrency.total;

            const goalDoc = await databases.createDocument<SalesGoalDocument>(
                DATABASE_ID,
                SALES_GOALS_ID,
                ID.unique(),
                {
                    boardId,
                    period,
                    targetAmount,
                    currency,
                    targetReached,
                    totalDeals,
                    totalDealsWon,
                }
            );

            // Set as active goal on the board
            await databases.updateDocument<SalesBoardDocument>(
                DATABASE_ID,
                SALES_BOARDS_ID,
                boardId,
                { activeGoalId: goalDoc.$id }
            );

            return ctx.json({
                data: {
                    id: goalDoc.$id,
                    boardId: goalDoc.boardId,
                    period: goalDoc.period,
                    targetAmount: goalDoc.targetAmount,
                    targetReached: goalDoc.targetReached > 0,
                    currency: goalDoc.currency,
                    totalDeals: goalDoc.totalDeals,
                    totalDealsWon: goalDoc.totalDealsWon,
                },
            });
        }
    );

export default app;
