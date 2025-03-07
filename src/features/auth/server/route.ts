import { Hono } from "hono"
import { zValidator } from '@hono/zod-validator';
import { loginSchema, registerSchema } from "../schemas";
import { createAdminClient } from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { deleteCookie, setCookie } from 'hono/cookie';
import { AUTH_COOKIE } from "../constants";
import { sessionMiddleware } from "@/lib/session-middleware";

const app = new Hono()

    .get(
        '/current',
        sessionMiddleware,
        ctx => {
            const user = ctx.get('user');
            return ctx.json({ data: user })
        }
    )

    .post(
        '/login',
        zValidator('json', loginSchema), //middleware
        async ctx => {

            const { email, password } = ctx.req.valid('json');

            const { account } = await createAdminClient();
            const session = await account.createEmailPasswordSession(
                email,
                password
            )

            setCookie(ctx, AUTH_COOKIE, session.secret, {
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 30
            })
            return ctx.json({ success: true })
        }
    )

    .post(
        '/register',
        zValidator('json', registerSchema),
        async ctx => {
            const { name, email, password } = ctx.req.valid('json');

            const { account } = await createAdminClient();
            await account.create(
                ID.unique(),
                email,
                password,
                name
            );

            const session = await account.createEmailPasswordSession(
                email,
                password
            )

            setCookie(ctx, AUTH_COOKIE, session.secret, {
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 30
            })

            return ctx.json({ success: true})
            // console.log({ email, password, name })

        }
    )

    .post(
        '/logout',
        sessionMiddleware,
        async ctx => {
            const account = ctx.get('account') //obtained by set function in sessionMidleware

            deleteCookie(ctx, AUTH_COOKIE);
            await account.deleteSession('current')

            return ctx.json({ success: true })
        }
    )

export default app;