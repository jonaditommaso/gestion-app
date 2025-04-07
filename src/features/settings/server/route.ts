import { sessionMiddleware } from "@/lib/session-middleware";
import { Hono } from "hono";
import { createSessionClient } from "@/lib/appwrite";
import { AuthenticatorType } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import { mfaCodeSchema } from "../schemas";

const app = new Hono()

.post(
    "/mfa-qr",
    sessionMiddleware,
    async (ctx) => {
        const { account } = await createSessionClient();

        const result = await account.createMfaAuthenticator(AuthenticatorType.Totp);

        const qr = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(result.uri)}&size=200x200`;

        return ctx.json({ qr })
    }
)

.post(
    "/create-mfa",
    sessionMiddleware,
    zValidator('json', mfaCodeSchema),
    async (ctx) => {
        const { account } = await createSessionClient();
        const { mfaCode } = ctx.req.valid('json');

        try {
            await account.updateMfaAuthenticator(AuthenticatorType.Totp, mfaCode);
            await account.updateMFA(true);

            return ctx.json({ success: true });

        } catch (err) {
            console.error("Failed to verify MFA:", err);
            return ctx.json({ error: "Invalid code or expired challenge" }, 400);
        }
    }
);

export default app;