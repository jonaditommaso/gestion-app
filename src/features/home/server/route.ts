import { Hono } from "hono";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from '@hono/zod-validator';
import { Client, Databases, ID, Query } from "node-appwrite";
import { DATABASE_ID, DEAL_COMMENTS_ID, DEAL_SELLERS_ID, DEALS_ID, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, MEETS_ID, MEMBERS_ID, MESSAGES_ID, NOTES_ID, TASK_ACTIVITY_LOGS_ID, TASKS_ID, USER_HOME_CONFIG_ID, WORKSPACES_ID } from "@/config";
import { meetSchema, messagesSchema, notesSchema, shortcutSchema, unreadMessagesSchema, updateMessageSchema } from "../schemas";
import { homeConfigSchema } from "../components/customization/schema";
import { createAdminClient } from "@/lib/appwrite";
import { getActiveContext } from "@/features/team/server/utils";
import { getMember } from "@/features/workspaces/members/utils";
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

            const { widgets, noteGlobalPinOnboarded } = ctx.req.valid('json');

            if (widgets === undefined && noteGlobalPinOnboarded === undefined) {
                return ctx.json({ error: 'At least one field is required' }, 400)
            }

            const existingConfigs = await databases.listDocuments(
                DATABASE_ID,
                USER_HOME_CONFIG_ID,
                [Query.equal('userId', user.$id)]
            );

            if (existingConfigs.total > 0) {
                return ctx.json({ error: 'Home config already exists' }, 409)
            }

            const createPayload: { userId: string; widgets?: string; noteGlobalPinOnboarded?: boolean } = {
                userId: user.$id,
            };

            if (widgets !== undefined) {
                createPayload.widgets = widgets;
            }

            if (noteGlobalPinOnboarded !== undefined) {
                createPayload.noteGlobalPinOnboarded = noteGlobalPinOnboarded;
            }

            const created = await databases.createDocument(
                DATABASE_ID,
                USER_HOME_CONFIG_ID,
                ID.unique(),
                createPayload
            );

            return ctx.json({ data: created })
        }
    )

    .patch(
        '/home-config',
        zValidator('json', homeConfigSchema),
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { widgets, noteGlobalPinOnboarded } = ctx.req.valid('json');

            if (widgets === undefined && noteGlobalPinOnboarded === undefined) {
                return ctx.json({ error: 'At least one field is required' }, 400)
            }

            const existingConfigs = await databases.listDocuments(
                DATABASE_ID,
                USER_HOME_CONFIG_ID,
                [Query.equal('userId', user.$id)]
            );

            if (existingConfigs.total === 0) {
                return ctx.json({ error: 'Home config not found' }, 404)
            }

            const updatePayload: { widgets?: string; noteGlobalPinOnboarded?: boolean } = {};

            if (widgets !== undefined) {
                updatePayload.widgets = widgets;
            }

            if (noteGlobalPinOnboarded !== undefined) {
                updatePayload.noteGlobalPinOnboarded = noteGlobalPinOnboarded;
            }

            const updated = await databases.updateDocument(
                DATABASE_ID,
                USER_HOME_CONFIG_ID,
                existingConfigs.documents[0].$id,
                updatePayload
            );

            return ctx.json({ data: updated })
        }
    )

    .post(
        '/notes',
        zValidator('json', notesSchema),
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { title, content, bgColor, isModern, hasLines } = ctx.req.valid('json');

            if (!title && !content) {
                return ctx.json({ error: 'Cannot create an empty note' }, 400)
            }

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ error: 'No active organization' }, 400);

            const workspacesResult = await databases.listDocuments(
                DATABASE_ID,
                WORKSPACES_ID,
                [Query.equal('teamId', context.org.appwriteTeamId), Query.orderAsc('$createdAt'), Query.limit(1)]
            );
            if (!workspacesResult.documents.length) return ctx.json({ error: 'No workspace found' }, 400);

            const member = await getMember({
                databases,
                workspaceId: workspacesResult.documents[0].$id,
                userId: user.$id,
            });
            if (!member) return ctx.json({ error: 'Unauthorized' }, 401);

            await databases.createDocument(
                DATABASE_ID,
                NOTES_ID,
                ID.unique(),
                {
                    title,
                    content,
                    bgColor,
                    isModern,
                    hasLines,
                    teamId: context.org.appwriteTeamId,
                    memberId: member.$id,
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

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ data: { documents: [], total: 0 } });

            const workspacesResult = await databases.listDocuments(
                DATABASE_ID,
                WORKSPACES_ID,
                [Query.equal('teamId', context.org.appwriteTeamId), Query.orderAsc('$createdAt'), Query.limit(1)]
            );
            if (!workspacesResult.documents.length) {
                return ctx.json({ data: { documents: [], total: 0 } });
            }

            const member = await getMember({
                databases,
                workspaceId: workspacesResult.documents[0].$id,
                userId: user.$id,
            });
            if (!member) return ctx.json({ data: { documents: [], total: 0 } });

            const notes = await databases.listDocuments(
                DATABASE_ID,
                NOTES_ID,
                [Query.equal('memberId', member.$id)]
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

            const { title, content, bgColor, isModern, hasLines, isPinned, pinnedAt, isGlobal, globalAt } = ctx.req.valid('json');

            const updateData: { title?: string; content?: string; bgColor?: string; isModern?: boolean; hasLines?: boolean; isPinned?: boolean; pinnedAt?: string | null; isGlobal?: boolean; globalAt?: string | null } = {};

            if (title !== undefined) updateData.title = title;
            if (content !== undefined) updateData.content = content;
            if (bgColor !== undefined) updateData.bgColor = bgColor;
            if (isModern !== undefined) updateData.isModern = isModern;
            if (hasLines !== undefined) updateData.hasLines = hasLines;
            if (isPinned !== undefined) updateData.isPinned = isPinned;
            if (pinnedAt !== undefined) updateData.pinnedAt = pinnedAt;
            if (isGlobal !== undefined) updateData.isGlobal = isGlobal;
            if (globalAt !== undefined) updateData.globalAt = globalAt;

            if (Object.keys(updateData).length === 0) {
                return ctx.json({ error: 'Note must have at least one field to update' }, 400)
            }

            const note = await databases.updateDocument(
                DATABASE_ID,
                NOTES_ID,
                noteId,
                updateData
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

            const { subject, content, toTeamMemberIds } = ctx.req.valid('json');

            if (!toTeamMemberIds.length || !content || !subject) {
                return ctx.json({ error: 'Cannot create the message' }, 400)
            }

            const msgContext = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!msgContext) return ctx.json({ error: 'No active organization' }, 400);
            const resolvedTeamId = msgContext.org.appwriteTeamId;

            // Obtener el fromTeamMemberId del usuario actual
            const { teams } = await createAdminClient();
            const { memberships } = await teams.listMemberships(resolvedTeamId);
            const currentMembership = memberships.find(m => m.userId === user.$id);

            if (!currentMembership) {
                return ctx.json({ error: 'User is not a member of this team' }, 403)
            }

            const fromTeamMemberId = currentMembership.$id;

            // Crear un mensaje para cada destinatario
            await Promise.all(
                toTeamMemberIds.map(async (toTeamMemberId) => {
                    await databases.createDocument(
                        DATABASE_ID,
                        MESSAGES_ID,
                        ID.unique(),
                        {
                            read: false,
                            subject,
                            content,
                            toTeamMemberId,
                            fromTeamMemberId,
                            teamId: resolvedTeamId
                        }
                    );
                })
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
            const { teams } = await createAdminClient();

            // Obtener el membership ID del usuario actual
            const msgContext = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!msgContext) return ctx.json({ data: { documents: [], total: 0 } });
            const { memberships } = await teams.listMemberships(msgContext.org.appwriteTeamId);
            const currentMembership = memberships.find(m => m.userId === user.$id);

            if (!currentMembership) {
                return ctx.json({ data: { documents: [], total: 0 } })
            }

            const messages = await databases.listDocuments(
                DATABASE_ID,
                MESSAGES_ID,
                [
                    Query.equal('toTeamMemberId', currentMembership.$id),
                    Query.orderDesc('$createdAt'),
                ],
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

    .get(
        '/messages/sent',
        sessionMiddleware,
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');
            const { teams } = await createAdminClient();

            const msgContext = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!msgContext) return ctx.json({ data: { documents: [], total: 0 } });

            const { memberships } = await teams.listMemberships(msgContext.org.appwriteTeamId);
            const currentMembership = memberships.find(m => m.userId === user.$id);
            if (!currentMembership) return ctx.json({ data: { documents: [], total: 0 } });

            const messages = await databases.listDocuments(
                DATABASE_ID,
                MESSAGES_ID,
                [
                    Query.equal('fromTeamMemberId', currentMembership.$id),
                    Query.orderDesc('$createdAt'),
                ]
            );

            return ctx.json({ data: messages });
        }
    )

    .patch(
        '/messages/:messageId',
        sessionMiddleware,
        zValidator('json', updateMessageSchema),
        async ctx => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');
            const { messageId } = ctx.req.param();
            const updates = ctx.req.valid('json');

            const message = await databases.getDocument(DATABASE_ID, MESSAGES_ID, messageId);

            const msgContext = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!msgContext) return ctx.json({ error: 'No active organization' }, 400);

            const { teams } = await createAdminClient();
            const { memberships } = await teams.listMemberships(msgContext.org.appwriteTeamId);
            const currentMembership = memberships.find(m => m.userId === user.$id);
            if (!currentMembership) return ctx.json({ error: 'Unauthorized' }, 403);

            const isRecipient = message.toTeamMemberId === currentMembership.$id;
            const isSender = message.fromTeamMemberId === currentMembership.$id;

            if (!isRecipient && !isSender) return ctx.json({ error: 'Forbidden' }, 403);

            const updateData: Record<string, boolean> = {};
            if (updates.read !== undefined && isRecipient) updateData.read = updates.read;
            if (updates.featured !== undefined) updateData.featured = updates.featured;
            if (updates.deletedByRecipient !== undefined && isRecipient) updateData.deletedByRecipient = updates.deletedByRecipient;
            if (updates.deletedBySender !== undefined && isSender) updateData.deletedBySender = updates.deletedBySender;

            if (Object.keys(updateData).length === 0) return ctx.json({ error: 'No valid fields to update' }, 400);

            const updated = await databases.updateDocument(DATABASE_ID, MESSAGES_ID, messageId, updateData);

            const finalDeletedByRecipient = updates.deletedByRecipient ?? (message.deletedByRecipient as boolean | undefined) ?? false;
            const finalDeletedBySender = updates.deletedBySender ?? (message.deletedBySender as boolean | undefined) ?? false;

            if (finalDeletedByRecipient && finalDeletedBySender) {
                await databases.deleteDocument(DATABASE_ID, MESSAGES_ID, messageId);
                return ctx.json({ data: { deleted: true } });
            }

            return ctx.json({ data: updated });
        }
    )

    .patch(
        '/shortcut',
        zValidator('json', shortcutSchema),
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const { users } = await createAdminClient();

            const { link, text, slot } = ctx.req.valid('json');

            if (!link || !text) {
                return ctx.json({ error: 'Cannot create the shortcut' }, 400)
            }

            const shortcutKey = slot || 'shortcut';

            await users.updatePrefs(user.$id, {
                ...(user.prefs ?? {}),
                [shortcutKey]: `${link},${text}`
            });

            return ctx.json({ success: true })
        }
    )

    .delete(
        '/shortcut/:slot',
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const { users } = await createAdminClient();
            const { slot } = ctx.req.param();

            if (slot !== 'shortcut' && slot !== 'shortcut2') {
                return ctx.json({ error: 'Invalid shortcut slot' }, 400)
            }

            // Remove the shortcut by setting it to empty string or undefined
            const newPrefs = { ...(user.prefs ?? {}) };
            delete newPrefs[slot];

            await users.updatePrefs(user.$id, newPrefs);

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
            const expiresAt = parseInt(cookieStore.get('google_access_token_exp')?.value ?? '0');

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

    .get(
        '/recent-activity',
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ data: [] });

            const teamId = context.org.appwriteTeamId;

            // Get org workspace IDs to scope task activity logs
            const workspacesResult = await databases.listDocuments(
                DATABASE_ID,
                WORKSPACES_ID,
                [Query.equal('teamId', teamId), Query.limit(200)]
            );
            const workspaceIds = workspacesResult.documents.map((w) => w.$id);

            // Get recent tasks from org workspaces (used to find relevant task activity logs)
            let recentTaskIds: string[] = [];
            if (workspaceIds.length > 0) {
                const recentTasksResult = await databases.listDocuments(
                    DATABASE_ID,
                    TASKS_ID,
                    [
                        Query.contains('workspaceId', workspaceIds.slice(0, 100)),
                        Query.orderDesc('$updatedAt'),
                        Query.limit(30),
                    ]
                );
                recentTaskIds = recentTasksResult.documents.map((t) => t.$id);
            }

            // Parallel fetches
            const [taskLogsResult, recentDealsResult, dealCommentsResult] = await Promise.all([
                recentTaskIds.length > 0
                    ? databases.listDocuments(
                        DATABASE_ID,
                        TASK_ACTIVITY_LOGS_ID,
                        [Query.equal('taskId', recentTaskIds), Query.orderDesc('$createdAt'), Query.limit(6)]
                    )
                    : Promise.resolve({ documents: [] }),
                databases.listDocuments(
                    DATABASE_ID,
                    DEALS_ID,
                    [Query.equal('teamId', teamId), Query.orderDesc('$updatedAt'), Query.limit(6)]
                ),
                databases.listDocuments(
                    DATABASE_ID,
                    DEAL_COMMENTS_ID,
                    [Query.equal('teamId', teamId), Query.orderDesc('$createdAt'), Query.limit(6)]
                ),
            ]);

            // Resolve task activity actor names (actorMemberId → MEMBERS_ID.$id)
            const taskActorIds = [...new Set(taskLogsResult.documents.map((l) => l.actorMemberId as string))];
            const taskActorNames: Record<string, string> = {};
            if (taskActorIds.length > 0) {
                const actorsResult = await databases.listDocuments(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.equal('$id', taskActorIds), Query.limit(50)]
                );
                for (const m of actorsResult.documents) {
                    taskActorNames[m.$id] = m.name as string;
                }
            }

            // Resolve task names
            const taskIds = [...new Set(taskLogsResult.documents.map((l) => l.taskId as string))];
            const taskTitles: Record<string, string> = {};
            if (taskIds.length > 0) {
                const tasksResult = await databases.listDocuments(
                    DATABASE_ID,
                    TASKS_ID,
                    [Query.equal('$id', taskIds), Query.limit(50)]
                );
                for (const t of tasksResult.documents) {
                    taskTitles[t.$id] = t.name as string;
                }
            }

            // Resolve deal comment actor names (authorMemberId → DEAL_SELLERS_ID.memberId)
            const commentAuthorIds = [...new Set(dealCommentsResult.documents.map((c) => c.authorMemberId as string))];
            const commentActorNames: Record<string, string> = {};
            if (commentAuthorIds.length > 0) {
                const sellersResult = await databases.listDocuments(
                    DATABASE_ID,
                    DEAL_SELLERS_ID,
                    [Query.equal('memberId', commentAuthorIds), Query.limit(50)]
                );
                for (const s of sellersResult.documents) {
                    commentActorNames[s.memberId as string] = s.name as string;
                }
            }

            // Resolve deal titles for comments
            const commentDealIds = [...new Set(dealCommentsResult.documents.map((c) => c.dealId as string))];
            const dealTitles: Record<string, string> = {};
            if (commentDealIds.length > 0) {
                const dealsForComments = await databases.listDocuments(
                    DATABASE_ID,
                    DEALS_ID,
                    [Query.equal('$id', commentDealIds), Query.limit(50)]
                );
                for (const d of dealsForComments.documents) {
                    dealTitles[d.$id] = d.title as string;
                }
            }

            type ActivityItem = {
                id: string;
                type: 'task_activity' | 'deal_created' | 'deal_won' | 'deal_activity';
                actorName: string | null;
                action: string;
                title: string;
                amount?: number;
                currency?: string;
                timestamp: string;
            };

            const items: ActivityItem[] = [
                // Task activity logs
                ...taskLogsResult.documents.map((log) => ({
                    id: log.$id,
                    type: 'task_activity' as const,
                    actorName: taskActorNames[log.actorMemberId as string] ?? null,
                    action: log.action as string,
                    title: taskTitles[log.taskId as string] ?? '',
                    timestamp: log.$createdAt,
                })),
                // Recently updated deals → show as WON or created
                ...recentDealsResult.documents
                    .filter((d) => d.outcome === 'WON' || d.outcome === 'PENDING')
                    .map((deal) => ({
                        id: deal.$id,
                        type: deal.outcome === 'WON' ? ('deal_won' as const) : ('deal_created' as const),
                        actorName: null,
                        action: deal.outcome === 'WON' ? 'deal_won' : 'deal_created',
                        title: deal.title as string,
                        amount: deal.amount as number,
                        currency: deal.currency as string,
                        timestamp: deal.outcome === 'WON' ? deal.$updatedAt : deal.$createdAt,
                    })),
                // Deal comments
                ...dealCommentsResult.documents.map((comment) => ({
                    id: comment.$id,
                    type: 'deal_activity' as const,
                    actorName: commentActorNames[comment.authorMemberId as string] ?? null,
                    action: 'deal_activity',
                    title: dealTitles[comment.dealId as string] ?? '',
                    timestamp: comment.$createdAt,
                })),
            ];

            items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            return ctx.json({ data: items.slice(0, 10) });
        }
    )

export default app;