import { sessionMiddleware } from "@/lib/session-middleware";
import { Hono } from "hono";
import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { AppwriteException, AuthenticatorType, ID } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import { changePasswordSchema, mfaCodeSchema } from "../schemas";
import { IMAGES_BUCKET_ID } from "@/config";
import { z } from "zod";

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
        '/change-password',
        sessionMiddleware,
        zValidator('json', changePasswordSchema),
        async (ctx) => {
            const account = ctx.get('account');
            const { currentPassword, newPassword, repeatPassword } = ctx.req.valid('json');

            if (newPassword !== repeatPassword) {
                return ctx.json({ error: 'Passwords do not match' }, 400);
            }

            try {
                await account.updatePassword(newPassword, currentPassword);
                return ctx.json({ success: true });
            } catch (error) {
                if (error instanceof AppwriteException) {
                    return ctx.json({ error: error.message }, 400);
                }

                return ctx.json({ error: 'Failed to update password' }, 500);
            }
        }
    )

    .post(
        '/upload-image',
        zValidator('form', z.object({
            image: z.any()
        })),
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const storage = ctx.get('storage');
            const { users } = await createAdminClient();

            const body = await ctx.req.formData()
            const image = body.get('image');

            if (image && image instanceof File) {
                // Validar tamaño (2MB máximo)
                if (image.size > 2 * 1024 * 1024) {
                    return ctx.json({ error: 'Image must be less than 2MB' }, 400);
                }

                // Validar tipo de archivo
                const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
                if (!allowedTypes.includes(image.type)) {
                    return ctx.json({ error: 'Only JPG, PNG, and SVG formats are allowed' }, 400);
                }

                const previousImage = user?.prefs?.image;                //eliminar foto previa
                if (previousImage) {
                    const fileList = await storage.listFiles(IMAGES_BUCKET_ID);
                    const matchedFile = fileList.files.find(file => {
                        return previousImage.includes(file.$id);
                    });

                    if (matchedFile) {
                        try {
                            await storage.deleteFile(IMAGES_BUCKET_ID, matchedFile.$id);
                        } catch (err) {
                            console.error('Error deleting previous image:', err);
                            // no arrojar un error, seguir el flujo
                        }
                    }
                }

                // upload new image, creating file
                const file = await storage.createFile(
                    IMAGES_BUCKET_ID,
                    ID.unique(),
                    image
                );

                await users.updatePrefs(user.$id, {
                    ...(user.prefs ?? {}),
                    image: file.$id
                });

                return ctx.json({ success: true })
            }

            return ctx.json({ success: false, message: 'No file uploaded' }, 400);
        }
    )

    .get(
        '/get-image/:userId?',
        sessionMiddleware,
        async ctx => {
            const storage = ctx.get('storage');
            const user = ctx.get('user');

            const { userId } = ctx.req.param();

            const { users } = await createAdminClient();

            let prefs;

            if (userId) {
                prefs = await users.getPrefs(userId);
            } else {
                prefs = user?.prefs;
            }

            if (!prefs?.image) {
                return ctx.json({ success: false, message: 'No image found for the user' }, 400);
            }


            const imageId = prefs.image;

            try {
                const fileMetadata = await storage.getFile(IMAGES_BUCKET_ID, imageId);
                const mimeType = fileMetadata.mimeType;

                const fileBuffer = await storage.getFileView(IMAGES_BUCKET_ID, imageId);

                return new Response(fileBuffer, {
                    headers: {
                        'Content-Type': mimeType,
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            } catch (err) {
                console.error('Error al obtener la imagen:', err);
                return ctx.json({ success: false, message: 'Error fetching the image' }, 500);
            }
        }
    )

    .delete(
        '/delete-image',
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const storage = ctx.get('storage');
            const { users } = await createAdminClient();

            const imageId = user?.prefs?.image;

            if (!imageId) {
                return ctx.json({ success: false, message: 'No image found for the user' }, 400);
            }

            try {
                // Eliminar el archivo del bucket
                await storage.deleteFile(IMAGES_BUCKET_ID, imageId);

                // Eliminar el id de la imagen de las preferencias del usuario
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { image: _image, ...restPrefs } = user.prefs ?? {};
                await users.updatePrefs(user.$id, restPrefs);

                return ctx.json({ success: true });
            } catch (err) {
                console.error('Error al eliminar la imagen:', err);
                return ctx.json({ success: false, message: 'Error deleting the image' }, 500);
            }
        }
    )

export default app;