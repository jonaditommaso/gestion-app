import { Hono } from "hono"
import { zValidator } from '@hono/zod-validator';
import { loginSchema, mfaSchema, registerSchema, userNameSchema } from "../schemas";
import { createAdminClient } from "@/lib/appwrite";
import {  ID } from "node-appwrite"; //Account, AppwriteException, AuthenticationFactor, Client, Models
import { deleteCookie, setCookie } from 'hono/cookie';
import { AUTH_COOKIE } from "../constants";
import { ContextType, sessionMiddleware } from "@/lib/session-middleware";

// function isErrorResponseWithChallengeId(response: unknown): response is { challengeId: string } {
//     return typeof response === 'object' && response !== null && 'challengeId' in response;
// }

const app = new Hono<ContextType>()

    .get(
        '/current',
        sessionMiddleware,
        ctx => {
            const user = ctx.get('user');
            return ctx.json({ data: user })
        }
    )

    // .post(
    //     '/login',
    //     zValidator('json', loginSchema), //middleware
    //     async ctx => {
    //         const { email, password } = ctx.req.valid('json');

    //         const { account: adminAccount } = await createAdminClient();
    //         const session = await adminAccount.createEmailPasswordSession(
    //             email,
    //             password
    //         )

    //         const client = new Client()
    //             .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    //             .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    //             .setSession(session.secret);

    //         const account = new Account(client);

    //         const current = await account.get();

    //         if (current.mfa === true) {
    //             const challenge = await account.createMfaChallenge(AuthenticationFactor.Totp);
    //             return ctx.json({ data: { mfaRequired: true, success: true, challengeId: challenge.$id, } }, 200);
    //         }

    //         setCookie(ctx, AUTH_COOKIE, session.secret, {
    //             path: '/',
    //             httpOnly: true,
    //             secure: true,
    //             sameSite: 'strict',
    //             maxAge: 60 * 60 * 24 * 30
    //         })
    //         return ctx.json({ data: { mfaRequired: false, success: true, challengeId: null } })
    //     }
    // ) //! este

    // .post('/login', zValidator('json', loginSchema), async ctx => {
    //     const { email, password } = ctx.req.valid('json');

    //     const { account: adminAccount } = await createAdminClient();

    //     let session: Models.Session;
    //     try {
    //       session = await adminAccount.createEmailPasswordSession(email, password);
    //     } catch (err) {
    //       return ctx.json({ error: `${err}, 'Invalid credentials'` }, 401);
    //     }

    //     // Crear cliente con la sesión parcial
    //     const client = new Client()
    //       .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    //       .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    //       .setSession(session.secret);

    //     const account = new Account(client);

    //     try {
    //         // Intentar crear un desafío MFA si es necesario
    //         const challenge = await account.createMfaChallenge(AuthenticationFactor.Totp);
    //         ctx.set('account', account);
    //       // Si llegamos aquí, es porque MFA es necesario
    //       return ctx.json({
    //         data: {
    //           mfaRequired: true,
    //           success: true,
    //           challengeId: challenge.$id // challengeId se obtiene correctamente aquí
    //         }
    //       });
    //     } catch (err: unknown) {
    //         console.log(err, 'ESTA ENTRANDO EN EL CATCH')
    //       if (err instanceof AppwriteException) {
    //         // Verificar si la respuesta contiene el challengeId de manera segura
    //         const errorResponse = err.response as unknown;

    //         if (isErrorResponseWithChallengeId(errorResponse)) {
    //           const challengeId = errorResponse.challengeId;
    //           return ctx.json({
    //             data: {
    //               mfaRequired: true,
    //               success: true,
    //               challengeId: challengeId || null
    //             }
    //           });
    //         }

    //         // Si no tiene challengeId, manejar el error de otra manera
    //         return ctx.json({ error: err.message }, 500);
    //       }

    //       // Si no es un AppwriteException, algo inesperado ocurrió
    //       return ctx.json({ error: 'Unexpected error' }, 500);
    //     }
    //   }) //? ultimo que funcionaba pero redireccionaba siempre al mfa

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
            return ctx.json({ success: true, data: { mfaRequired: false, challengeId: null } })
        }
    )

    .post(
        '/register',
        zValidator('json', registerSchema),
        async ctx => {
            const { name, email, password, plan, company, isDemo } = ctx.req.valid('json');

            const { account, users, teams } = await createAdminClient();

            const newUser = await account.create(
                ID.unique(),
                email,
                password,
                name
            );

            const newTeam = await teams.create(
                ID.unique(),
                company
            )

            await teams.createMembership(
                newTeam.$id,
                ['OWNER'],
                email,
            );

            await users.updatePrefs(newUser.$id, { plan, company, role: 'ADMIN', teamId: newTeam.$id, isDemo });

            await teams.updatePrefs(newTeam.$id, { plan, isDemo })


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

    .patch(
        '/update-username',
        zValidator('json', userNameSchema),
        sessionMiddleware,
        async (ctx) => {
          const { userName } = ctx.req.valid('json');
          const user = ctx.get('user');

          const { users } = await createAdminClient();

          await users.updateName(user.$id, userName);

          return ctx.json({ success: true, message: 'Updated username' });
        }
    )

    .post('/mfa',
        zValidator('json', mfaSchema),
        sessionMiddleware,
        async ctx => {

        const { mfaCode, challengeId } = ctx.req.valid('json');

        //const { account } = await createAdminClient();
        const account = ctx.get('account');

        if (!account) {
            return ctx.json({ success: false, error: 'Account not found' }, 401);
        }

        try {
            // Verificamos el código MFA
            await account.updateMfaChallenge(challengeId, mfaCode);

            // Obtenemos la sesión actual
            const session = await account.getSession('current');

            setCookie(ctx, AUTH_COOKIE, session.secret, {
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 30,
            });

            return ctx.json({ success: true }, 200);
        } catch (error) {
            console.error(error);
            return ctx.json({ success: false, error: 'Invalid MFA code' }, 401);
        }
    })


    .delete(
        '/',
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');

            const { users } = await createAdminClient();

            const account = ctx.get('account')

            deleteCookie(ctx, AUTH_COOKIE);
            await account.deleteSession('current')

            await users.delete(user.$id)

            return ctx.json({ success: true })
        }
    )

export default app;