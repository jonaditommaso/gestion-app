import { Hono } from "hono";
import { sessionMiddleware } from "@/lib/session-middleware";
import { createAdminClient } from "@/lib/appwrite";
import { zValidator } from '@hono/zod-validator';
import { birthdaySchema, inviteSchema, tagsSchema } from "../schema";
import { Client, Databases, ID, Query } from "node-appwrite";
import { DATABASE_ID, INVITES_ID } from "@/config";
import { companyNameSchema, registerByInvitationSchema } from "@/features/auth/schemas";
import { setCookie } from "hono/cookie";
import { AUTH_COOKIE } from "@/features/auth/constants";

const app = new Hono()

.get(
    '/',
    sessionMiddleware,
    async ctx => {
        const user = ctx.get('user');
        const { users, teams } = await createAdminClient();

        const { memberships } = await teams.listMemberships(user.prefs.teamId);

        const fullMembers = await Promise.all(
            memberships.map(async member => {
                const user = await users.get(member.userId)

                return {
                    ...user,
                    ...member // probably not needed, check it out. it seems user has all the data we need
                }
            })
        )

        return ctx.json({ data: fullMembers })
    }
)

.patch(
    '/tags',
    zValidator('json', tagsSchema),
    sessionMiddleware,
    async ctx => {
        // designed to work only with the current user.
        // todo changes to edit as admin
        const user = ctx.get('user');
        const { users } = await createAdminClient();

        const { tag } = ctx.req.valid('json');

        const currentUser = await users.get(user.$id);
        const currentTags = currentUser.prefs.tags
            ? currentUser.prefs.tags.split(',').map((tag: string) => tag.trim())
            : [];

        if (currentTags.includes(tag) || currentTags.length >= 3) {
            return ctx.json({ tags: currentTags.join(',') });
        }

        currentTags.push(tag);

        await users.updatePrefs(user.$id, {
            ...(user.prefs ?? {}),
            tags: currentTags.join(','),
        });

        return ctx.json({ tags: currentTags.join(',') });
    }
)

.patch(
    '/birthday',
    zValidator('json', birthdaySchema),
    sessionMiddleware,
    async ctx => {
        // designed to work only with the current user.
        // todo changes to edit as admin
        const user = ctx.get('user');
        const { users } = await createAdminClient();

        const { birthday } = ctx.req.valid('json');

        await users.updatePrefs(user.$id, {
            ...(user.prefs ?? {}),
            birthday: birthday,
        });

        return ctx.json({ birthday });
    }
)

//? aparentemente parece que esta logica creando peticion pendiente de membership funcionaria si tuviera SMTP server configurado
// .post(
//     '/invite',
//     zValidator('json', inviteSchema),
//     sessionMiddleware,
//     async ctx => {
//         const user = ctx.get('user');
//         const databases = ctx.get('databases');
//         const { teams } = await createAdminClient();

//         const { email } = ctx.req.valid('json');

//         const token = crypto.randomUUID();

//         await databases.createDocument(
//             DATABASE_ID,
//             INVITES_ID,
//             ID.unique(),
//             {
//                 token,
//                 teamId: user.prefs.teamId,
//                 email,
//                 accepted: false,
//                 invitedBy: user.$id,
//                 invitedByName: user.name,
//             }
//         );

//         await teams.createMembership(
//             user.prefs.teamId,
//             ['CREATOR'],
//             email,
//             undefined,
//             undefined,
//             `http://localhost:3000/join-team?token=${token}`,
//             user.prefs.company
//         )

//         return ctx.json({ success: true });
//     }
// )

//? modificamos un poco el flujo, adaptandolo a la invitacion por copy code
.post(
    '/invite',
    zValidator('json', inviteSchema),
    sessionMiddleware,
    async ctx => {
        const user = ctx.get('user');
        const databases = ctx.get('databases');

        const { email } = ctx.req.valid('json');

        const token = crypto.randomUUID();

        await databases.createDocument(
            DATABASE_ID,
            INVITES_ID,
            ID.unique(),
            {
                token,
                teamId: user.prefs.teamId,
                teamName: user.prefs.company,
                email,
                accepted: false,
                invitedBy: user.$id,
                userId: user.$id,
                invitedByName: user.name,
            }
        );

        return ctx.json({ invitationUrl: `http://localhost:3000/team/join-team/${token}` , success: true })
    }
)

.get(
    '/join-team/:token',
    async ctx => {
        const token = ctx.req.param('token');

        if(!token) return ctx.json({ error: 'No token provided' }, 400)

        // we cannot use sessionMiddleware because there is not a registered user.
        const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)

        const databases = new Databases(client);

        const invite = await databases.listDocuments(
            DATABASE_ID,
            INVITES_ID,
            [
                Query.equal('token', token),
                Query.equal('accepted', false)
            ]
        );

        if (invite.total === 0) {
            return ctx.json({ error: 'Invalid or expired token' }, 400);
        }

        return ctx.json({ data: invite.documents[0] });
    }
)

.post(
    '/join-team',
    zValidator('json', registerByInvitationSchema),
    async ctx => {
        const { name, email, password, teamId, teamName, inviteId } = ctx.req.valid('json');

        const { account, users, teams } = await createAdminClient();

        const newUser = await account.create(
            ID.unique(),
            email,
            password,
            name
        );

        await teams.createMembership(
            teamId,
            ['CREATOR'],
            email,
        );

        const teamPrefs = await teams.getPrefs(teamId)

        await users.updatePrefs(newUser.$id, { plan: 'invited', company: teamName, role: 'CREATOR', teamId, isDemo: teamPrefs?.isDemo });


        const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)

        const databases = new Databases(client);

        await databases.updateDocument(
            DATABASE_ID,
            INVITES_ID,
            inviteId,
            { accepted: true }
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
    }
)

.patch(
    '/edit-name',
    zValidator('json', companyNameSchema),
    sessionMiddleware,
    async ctx => {
        const { company } = ctx.req.valid('json');

        const user = ctx.get('user');
        const { users, teams } = await createAdminClient();

        await teams.updateName(
            user.prefs.teamId,
            company
        );

        await users.updatePrefs(user.$id, {
            ...(user.prefs ?? {}),
            company
        });

        return ctx.json({ success: true })

    }
)

export default app;