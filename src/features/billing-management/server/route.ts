import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { billingOperationSchema } from "../schemas";
import { BILLINGS_ID, DATABASE_ID } from "@/config";
import { ID } from "node-appwrite";

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

export default app;