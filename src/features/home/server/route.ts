import { Hono } from "hono";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from '@hono/zod-validator';
import { Client, Databases, ID, Query } from "node-appwrite";
import { DATABASE_ID, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, MEETS_ID, MESSAGES_ID, NOTES_ID, USER_HOME_CONFIG_ID } from "@/config";
import { meetSchema, messagesSchema, notesSchema, shortcutSchema, unreadMessagesSchema } from "../schemas";
import { homeConfigSchema } from "../components/customization/schema";
import { createAdminClient } from "@/lib/appwrite";
import { google } from 'googleapis';
import { cookies } from "next/headers";
import dayjs from "dayjs";

const app = new Hono()

    .get(
        '/home-config',
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const configs = await databases.listDocuments(
                DATABASE_ID,
                USER_HOME_CONFIG_ID,
                [Query.equal('userId', user.$id)]
            );

            if (configs.total === 0) {
                return ctx.json({ data: null })
            }

            return ctx.json({ data: configs.documents[0] })
        }
    )

    .post(
        '/home-config',
        zValidator('json', homeConfigSchema),
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { widgets } = ctx.req.valid('json');

            const existingConfigs = await databases.listDocuments(
                DATABASE_ID,
                USER_HOME_CONFIG_ID,
                [Query.equal('userId', user.$id)]
            );

            if (existingConfigs.total > 0) {
                const updated = await databases.updateDocument(
                    DATABASE_ID,
                    USER_HOME_CONFIG_ID,
                    existingConfigs.documents[0].$id,
                    { widgets }
                );
                return ctx.json({ data: updated })
            }

            const created = await databases.createDocument(
                DATABASE_ID,
                USER_HOME_CONFIG_ID,
                ID.unique(),
                {
                    userId: user.$id,
                    widgets
                }
            );

            return ctx.json({ data: created })
        }
    )

    .post(
        '/notes',
        zValidator('json', notesSchema),
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { title, content, bgColor } = ctx.req.valid('json');

            if (!title && !content) {
                return ctx.json({ error: 'Cannot create an empty note' }, 400)
            }

            await databases.createDocument(
                DATABASE_ID,
                NOTES_ID,
                ID.unique(),
                {
                    title,
                    content,
                    bgColor,
                    userId: user.$id,
                }
            );

            return ctx.json({ success: true })
        }
    )

    .get(
        '/notes',
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const notes = await databases.listDocuments(
                DATABASE_ID,
                NOTES_ID,
                [Query.equal('userId', user.$id)]
            );

            if (notes.total === 0) {
                return ctx.json({ data: { documents: [], total: 0 } })
            }

            return ctx.json({ data: notes })
        }
    )

    .patch(
        '/notes/:noteId',
        zValidator('json', notesSchema),
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');
            const { noteId } = ctx.req.param();

            const { title, content, bgColor } = ctx.req.valid('json');

            if (!title && !content) {
                return ctx.json({ error: 'Note must have at least a title or content' }, 400)
            }

            const note = await databases.updateDocument(
                DATABASE_ID,
                NOTES_ID,
                noteId,
                {
                    title,
                    content,
                    bgColor,
                }
            );

            return ctx.json({ data: note })
        }
    )

    .delete(
        '/notes/:noteId',
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');
            const { noteId } = ctx.req.param();

            await databases.deleteDocument(
                DATABASE_ID,
                NOTES_ID,
                noteId
            );

            return ctx.json({ success: true })
        }
    )

    .post(
        '/messages',
        zValidator('json', messagesSchema),
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { content, to } = ctx.req.valid('json');

            if (!to && !content) {
                return ctx.json({ error: 'Cannot create the message' }, 400)
            }

            await databases.createDocument(
                DATABASE_ID,
                MESSAGES_ID,
                ID.unique(),
                {
                    read: false,
                    content,
                    to,
                    from: user.$id,
                    userId: user.$id
                }
            );

            return ctx.json({ success: true })
        }
    )

    .get(
        '/messages',
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const messages = await databases.listDocuments(
                DATABASE_ID,
                MESSAGES_ID,
                [Query.equal('to', user.$id)]
            );

            if (messages.total === 0) {
                return ctx.json({ data: { documents: [], total: 0 } })
            }

            return ctx.json({ data: messages })
        }
    )

    .post(
        '/messages/bulk-update',
        sessionMiddleware,
        zValidator('json', unreadMessagesSchema),
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            if (!user) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const { unreadMessages } = ctx.req.valid('json');

            const updatedMessages = await Promise.all(unreadMessages.map(async message => {
                const { $id } = message;

                return databases.updateDocument(
                    DATABASE_ID,
                    MESSAGES_ID,
                    $id,
                    {
                        read: true
                    }
                )
            }))


            return ctx.json({ data: updatedMessages })
        }
    )

    .patch(
        '/shortcut',
        zValidator('json', shortcutSchema),
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const { users } = await createAdminClient();

            const { link, text } = ctx.req.valid('json');

            if (!link || !text) {
                return ctx.json({ error: 'Cannot create the shortcut' }, 400)
            }

            await users.updatePrefs(user.$id, {
                ...(user.prefs ?? {}),
                shortcut: `${link},${text}`
            });

            return ctx.json({ success: true })
        }
    )

    .post(
        '/meet-validation-permission',
        zValidator('json', meetSchema),
        sessionMiddleware,
        async ctx => {

            const { dateStart, invited, title, duration, userId } = ctx.req.valid('json');
            const user = ctx.get('user');

            const cookieStore = await cookies();
            const accessToken = cookieStore.get('google_access_token')?.value;
            const expiresAt = parseInt(cookieStore.get('google_token_exp')?.value ?? '0');

            if ((!accessToken || Date.now() > expiresAt) && !user?.prefs.google_refresh_token) { // escenario 1, no hay ni token ni refresh

                const oauth2Client = new google.auth.OAuth2(
                    GOOGLE_CLIENT_ID,
                    GOOGLE_CLIENT_SECRET,
                    GOOGLE_REDIRECT_URI,
                );

                const scopes = [
                    'openid',
                    'email',
                    'profile',
                    'https://www.googleapis.com/auth/calendar.events'
                ]

                const url = oauth2Client.generateAuthUrl({
                    access_type: 'offline',
                    prompt: 'consent', // CHEQUEAR SI ES NECESARIO O ESTAMOS AGREGANDO UNA CAPA AL PEDO.
                    client_id: GOOGLE_CLIENT_ID,
                    scope: scopes,
                    state: JSON.stringify({ dateStart, invited, title, duration, userId })
                });

                return ctx.json({ data: url })
            }

            const params = new URLSearchParams();

            params.set("invited", invited);
            params.set("dateStart", dateStart.toISOString());
            params.set("title", title);
            params.set("duration", duration);
            params.set("userId", userId);

            if ((Date.now() > expiresAt || !accessToken) && user?.prefs.google_refresh_token) { // escenario 2, no hay token o expiro pero tenes el refresh en las prefs
                params.set("use-refresh", 'true');
            }

            if (accessToken && Date.now() < expiresAt) { // escenario 3, todo ok, el access tiene validez
                params.set("use-access-token", 'true');
            }

            return ctx.json({ data: `${GOOGLE_REDIRECT_URI}?${params.toString()}` })
        }
    )

    .get(
        '/meet',
        async ctx => {

            const cookieStore = await cookies();
            const token = cookieStore.get('google_access_token')?.value;

            const url = new URL(ctx.req.url);
            const invited = url.searchParams.get('invited');
            const dateStart = url.searchParams.get('dateStart');
            const title = url.searchParams.get('title');
            const duration = url.searchParams.get('duration') || '';
            const userId = url.searchParams.get('userId');

            const date = dayjs(dateStart)

            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const [amount, unit] = duration.split('-');
            const eventEnd = date.add(Number(amount), unit === 'minute' ? unit : 'hour');

            const oAuth2Client = new google.auth.OAuth2();
            oAuth2Client.setCredentials({ access_token: token });

            const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

            const response = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: {
                    summary: title,
                    start: {
                        dateTime: date.toISOString(),
                        timeZone,
                    },
                    end: {
                        dateTime: eventEnd.toISOString(),
                        timeZone,
                    },
                    attendees: [
                        { email: invited }
                    ],
                    conferenceData: {
                        createRequest: {
                            requestId: `meet-${Date.now()}`,
                            conferenceSolutionKey: { type: 'hangoutsMeet' },
                        },
                    },
                },
                conferenceDataVersion: 1,
            });

            const client = new Client()
                .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
                .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)

            const databases = new Databases(client);

            await databases.createDocument(
                DATABASE_ID,
                MEETS_ID,
                ID.unique(),
                {
                    userId,
                    title,
                    with: invited,
                    url: response.data?.hangoutLink ?? '',
                    date: date.toISOString(),
                }
            )

            return ctx.redirect('/meets/loading');

        }
    )

    .get(
        '/meets',
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const [createdMeets, invitedMeets] = await Promise.all([
                databases.listDocuments(DATABASE_ID, MEETS_ID, [
                    Query.equal('userId', user.$id)
                ]),
                databases.listDocuments(DATABASE_ID, MEETS_ID, [
                    Query.contains('with', user.email)
                ])
            ]);

            const now = new Date();
            const meets = [...createdMeets.documents, ...invitedMeets.documents]
                .filter(meet => new Date(meet.date) > now)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 3);

            // los filtros los aplico ahora porque solo las pido en la home, pero cuando tenga una view, sera por query.

            return ctx.json({ data: meets })
        }
    )

export default app;