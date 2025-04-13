import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { billingOperationSchema, billingCategoriesSchema } from '../schemas';
import { BILLING_OPTIONS_ID, BILLINGS_ID, DATABASE_ID } from "@/config";
import { ID, Query } from "node-appwrite";

const app = new Hono()

    .post(
        '/',
        sessionMiddleware,
        zValidator('json', billingOperationSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { account, category, date, import: importValue, type, note } = ctx.req.valid('json');

            if(!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const newOperation = await databases.createDocument(
                DATABASE_ID,
                BILLINGS_ID,
                ID.unique(),
                {
                    account,
                    category,
                    date,
                    import: Number(importValue),
                    type,
                    note
                }
            )

            return ctx.json({ data: newOperation })
        }
    )

    .get(
        '/',
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            if(!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            try {
                const operations = await databases.listDocuments(
                    DATABASE_ID,
                    BILLINGS_ID,
                    [
                        Query.equal('userId', user.$id),
                        Query.orderDesc('$createdAt'),
                    ]
                );

                return ctx.json({ data: operations });
            } catch (err) {
                console.error('Error fetching billing operations:', err);
                return ctx.json({ data: { total: 0, documents: [] } }, 200);
            }
        }
    )

    .get(
        '/options',
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            if(!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const billingOptions = await databases.listDocuments(
                DATABASE_ID,
                BILLING_OPTIONS_ID,
                [Query.equal('userId', user.$id)]
            );

            if(billingOptions.total === 0) {
                return ctx.json({ data: { documents: [], total: 0 } })
            }

            return ctx.json({ data: billingOptions })

        }
    )

    .post(
        '/options',
        sessionMiddleware,
        zValidator('json', billingCategoriesSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { incomeCategories, expenseCategories } = ctx.req.valid('json');

            if(!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const options = await databases.createDocument(
                DATABASE_ID,
                BILLING_OPTIONS_ID,
                ID.unique(),
                {
                    incomeCategories,
                    expenseCategories,
                    userId: user.$id,
                }
            )

            return ctx.json({ data: options })
        }
    )

    .patch(
        '/options/:billingOptionId',
        sessionMiddleware,
        zValidator('json', billingCategoriesSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { incomeCategories, expenseCategories } = ctx.req.valid('json');

            const { billingOptionId } = ctx.req.param()

            if(!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const newOperation = await databases.updateDocument(
                DATABASE_ID,
                BILLING_OPTIONS_ID,
                billingOptionId,
                {
                    incomeCategories,
                    expenseCategories
                }
            )

            return ctx.json({ data: newOperation })
        }
    )

export default app;