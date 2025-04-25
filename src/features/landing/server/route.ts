import { Hono } from "hono";
import { zValidator } from '@hono/zod-validator';
import { Client, Databases, ID } from "node-appwrite";
import { DATABASE_ID, PRICING_ID } from "@/config";
import { requestEnterpriseSchema } from "../schemas";

const app = new Hono()

.post(
    '/request-enterprise',
    zValidator('json', requestEnterpriseSchema),
    async ctx => {
        const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)

        const databases = new Databases(client);

        const { email, message } = ctx.req.valid('json');

        if(!email) {
            return ctx.json({ error: 'Cannot create request without email' }, 400)
        }

        await databases.createDocument(
            DATABASE_ID,
            PRICING_ID,
            ID.unique(),
            {
                email,
                message
            }
        );

        return ctx.json({ success: true })
    }
)

export default app;