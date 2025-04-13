import { sessionMiddleware } from "@/lib/session-middleware";
import { Hono } from "hono";
import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { AuthenticatorType, ID } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import { mfaCodeSchema } from "../schemas";
import { IMAGES_BUCKET_ID } from "@/config";

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
)

.post(
    '/upload-image',
    // zValidator('json', profilePhotoSchema),
    sessionMiddleware,
    async ctx => {
        const user = ctx.get('user');
        const storage = ctx.get('storage');
        const { users } = await createAdminClient();

        const body = await ctx.req.formData()
        const image = body.get('image');

        let uploadImageUrl: string | undefined;

        if (image && image instanceof File) {

            const file = await storage.createFile(
                IMAGES_BUCKET_ID,
                ID.unique(),
                image
            )

            const arrayBuffer = await storage.getFileDownload(
                IMAGES_BUCKET_ID,
                file.$id
            );

            uploadImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`

            await users.updatePrefs(user.$id, {
                ...user.prefs,
                image: uploadImageUrl
            });

            return ctx.json({ success: true })
        }

        return ctx.json({ success: false, message: 'No file uploaded' }, 400);
    }
)

export default app;