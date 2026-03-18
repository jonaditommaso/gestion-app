import { Hono } from "hono";
import { sessionMiddleware } from "@/lib/session-middleware";
import { createAdminClient } from "@/lib/appwrite";
import { zValidator } from '@hono/zod-validator';
import { birthdaySchema, createTeamSchema, inviteSchema, profileSchema, tagsSchema } from "../schema";
import { Client, Databases, ID, Query } from "node-appwrite";
import { DATABASE_ID, INVITES_ID, MEMBERSHIPS_ID, NEXT_PUBLIC_APP_URL, NOTIFICATIONS_ID, ORGANIZATIONS_ID, STRIPE_SECRET_KEY } from "@/config";
import { companyNameSchema, registerByInvitationSchema } from "@/features/auth/schemas";
import { setCookie } from "hono/cookie";
import { AUTH_COOKIE } from "@/features/auth/constants";
import { getActiveContext } from "./utils";
import { Membership, Organization, OrganizationPlan, BillingCycle } from "../types";
import { z as zod } from 'zod';
import { Stripe } from "stripe";
import { NotificationBodySeparator, NotificationEntityType, NotificationI18nKey, NotificationType } from "@/features/notifications/types";

const app = new Hono()

    .post(
        '/create',
        zValidator('json', createTeamSchema),
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const { company, plan, billingCycle, stripeSessionId } = ctx.req.valid('json');

            const { users, teams, databases: adminDatabases } = await createAdminClient();

            let stripeCustomerId: string | undefined;
            let stripeSubscriptionId: string | undefined;
            let nextRenewal: string | undefined;
            let paymentMethodLast4: string | undefined;
            let cancelAtPeriodEnd = false;
            let subscriptionStatus = plan === 'free' ? 'free' : 'active';

            if (plan !== 'free') {
                if (!stripeSessionId) {
                    return ctx.json({ error: 'Missing Stripe session' }, 400);
                }

                const stripe = new Stripe(STRIPE_SECRET_KEY);
                const checkoutSession = await stripe.checkout.sessions.retrieve(stripeSessionId, {
                    expand: ['customer', 'subscription'],
                });

                if (checkoutSession.payment_status !== 'paid') {
                    return ctx.json({ error: 'Payment not confirmed' }, 400);
                }

                const customer = checkoutSession.customer;
                const subscription = checkoutSession.subscription;

                if (!subscription) {
                    return ctx.json({ error: 'Invalid Stripe session data' }, 400);
                }
                stripeSubscriptionId = typeof subscription === 'string' ? subscription : subscription.id;

                const fullSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId) as unknown as Stripe.Subscription & { current_period_end: number };

                const getStripeId = (val: string | { id: string } | null | undefined): string | undefined => {
                    if (!val) return undefined;
                    return typeof val === 'string' ? val : val.id;
                };

                stripeCustomerId = getStripeId(customer) ?? getStripeId(fullSubscription.customer as string | { id: string });

                subscriptionStatus = fullSubscription.status;
                nextRenewal = new Date(fullSubscription.current_period_end * 1000).toISOString();
                cancelAtPeriodEnd = fullSubscription.cancel_at_period_end;

                if (stripeCustomerId) {
                    try {
                        const paymentMethods = await stripe.paymentMethods.list({
                            customer: stripeCustomerId,
                            type: 'card',
                            limit: 1,
                        });
                        paymentMethodLast4 = paymentMethods.data[0]?.card?.last4;
                    } catch {
                        // non-critical — fetched live from Stripe in /organization
                    }
                }
            }

            const newTeam = await teams.create(ID.unique(), company);

            await teams.createMembership(newTeam.$id, ['OWNER'], user.email);

            await teams.updatePrefs(newTeam.$id, { plan, billingCycle });

            const planUppercase: OrganizationPlan =
                plan === 'plus' ? 'PLUS' :
                    plan === 'pro' ? 'PRO' : 'FREE';

            const newOrg = await adminDatabases.createDocument<Organization>(
                DATABASE_ID,
                ORGANIZATIONS_ID,
                ID.unique(),
                {
                    name: company,
                    plan: planUppercase,
                    billingCycle: billingCycle ?? 'MONTHLY',
                    subscriptionStatus,
                    stripeCustomerId,
                    stripeSubscriptionId,
                    nextRenewal,
                    paymentMethodLast4,
                    cancelAtPeriodEnd,
                    appwriteTeamId: newTeam.$id,
                    isDemo: false,
                }
            );

            await adminDatabases.createDocument(
                DATABASE_ID,
                MEMBERSHIPS_ID,
                ID.unique(),
                {
                    userId: user.$id,
                    organizationId: newOrg.$id,
                    role: 'OWNER',
                }
            );

            await users.updatePrefs(user.$id, {
                image: user.prefs?.image,
            });

            return ctx.json({ success: true });
        }
    )

    .get(
        '/',
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { users, teams } = await createAdminClient();

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ data: [], orgName: '' });

            const { org } = context;

            const dbMemberships = await databases.listDocuments<Membership>(
                DATABASE_ID,
                MEMBERSHIPS_ID,
                [Query.equal('organizationId', org.$id)]
            );

            const { memberships: appwriteMemberships } = await teams.listMemberships(org.appwriteTeamId);

            const fullMembers = await Promise.all(
                dbMemberships.documents.map(async (mem) => {
                    const memberUser = await users.get(mem.userId);
                    const appwriteMem = appwriteMemberships.find(m => m.userId === mem.userId);

                    return {
                        $id: mem.$id,
                        appwriteMembershipId: appwriteMem?.$id ?? null,
                        userId: mem.userId,
                        organizationId: mem.organizationId,
                        appwriteTeamId: org.appwriteTeamId,
                        name: memberUser.name,
                        email: memberUser.email,
                        status: memberUser.status,
                        userName: memberUser.name,
                        userEmail: memberUser.email,
                        prefs: {
                            image: memberUser.prefs?.image,
                            role: mem.role,
                            position: mem.position ?? '',
                            description: mem.description ?? '',
                            linkedin: mem.linkedin ?? '',
                            tags: mem.tags ?? '',
                            birthday: mem.birthday ?? '',
                            memberSince: mem.memberSince ?? '',
                            currentProject: mem.currentProject ?? '',
                        },
                    };
                })
            );

            return ctx.json({ data: fullMembers, orgName: org.name });
        }
    )

    .get(
        '/context',
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ data: null });

            const { databases: adminDatabases } = await createAdminClient();

            const { documents: allMemberships } = await adminDatabases.listDocuments<Membership>(
                DATABASE_ID,
                MEMBERSHIPS_ID,
                [Query.equal('userId', user.$id)]
            );

            const allContexts = await Promise.all(
                allMemberships.map(async (mem) => {
                    const org = await adminDatabases.getDocument<Organization>(
                        DATABASE_ID,
                        ORGANIZATIONS_ID,
                        mem.organizationId
                    );
                    return { membership: mem, org };
                })
            );

            return ctx.json({ data: { membership: context.membership, org: context.org, allContexts } });
        }
    )

    .post(
        '/switch',
        zValidator('json', zod.object({ membershipId: zod.string().trim().min(1) })),
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const { membershipId } = ctx.req.valid('json');

            const { databases: adminDatabases } = await createAdminClient();

            const membership = await adminDatabases.getDocument<Membership>(
                DATABASE_ID,
                MEMBERSHIPS_ID,
                membershipId
            );

            if (membership.userId !== user.$id) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            const org = await adminDatabases.getDocument<Organization>(
                DATABASE_ID,
                ORGANIZATIONS_ID,
                membership.organizationId
            );

            const isSecure = process.env.NODE_ENV === 'production';
            setCookie(ctx, 'active-org-id', membershipId, {
                path: '/',
                httpOnly: true,
                secure: isSecure,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 365
            });

            return ctx.json({ data: { membership, org } });
        }
    )

    .post(
        '/leave-organization',
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { teams, databases: adminDatabases } = await createAdminClient();

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ error: 'No active organization' }, 400);

            if (context.membership.role === 'OWNER') {
                return ctx.json({ error: 'Owners cannot leave their organization' }, 403);
            }

            const { memberships: appwriteMemberships } = await teams.listMemberships(context.org.appwriteTeamId);
            const appwriteMembership = appwriteMemberships.find(membership => membership.userId === user.$id);

            if (appwriteMembership?.$id) {
                await teams.deleteMembership(context.org.appwriteTeamId, appwriteMembership.$id);
            }

            await adminDatabases.deleteDocument(
                DATABASE_ID,
                MEMBERSHIPS_ID,
                context.membership.$id
            );

            const remainingMemberships = await adminDatabases.listDocuments<Membership>(
                DATABASE_ID,
                MEMBERSHIPS_ID,
                [
                    Query.equal('userId', user.$id),
                    Query.limit(1),
                ]
            );

            const isSecure = process.env.NODE_ENV === 'production';
            const nextMembership = remainingMemberships.documents[0]?.$id;

            if (nextMembership) {
                setCookie(ctx, 'active-org-id', nextMembership, {
                    path: '/',
                    httpOnly: true,
                    secure: isSecure,
                    sameSite: 'strict',
                    maxAge: 60 * 60 * 24 * 365
                });
            } else {
                setCookie(ctx, 'active-org-id', '', {
                    path: '/',
                    httpOnly: true,
                    secure: isSecure,
                    sameSite: 'strict',
                    maxAge: 0,
                });
            }

            return ctx.json({ success: true, nextMembershipId: nextMembership ?? null });
        }
    )

    .post(
        '/remove-member',
        zValidator('json', zod.object({ membershipId: zod.string().trim().min(1) })),
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { membershipId } = ctx.req.valid('json');
            const { teams, databases: adminDatabases } = await createAdminClient();

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ error: 'No active organization' }, 400);

            if (context.membership.role !== 'OWNER' && context.membership.role !== 'ADMIN') {
                return ctx.json({ error: 'Unauthorized' }, 403);
            }

            const targetMembership = await adminDatabases.getDocument<Membership>(
                DATABASE_ID,
                MEMBERSHIPS_ID,
                membershipId
            );

            if (targetMembership.organizationId !== context.org.$id) {
                return ctx.json({ error: 'Membership does not belong to current organization' }, 400);
            }

            if (targetMembership.role === 'OWNER') {
                return ctx.json({ error: 'Owner cannot be removed' }, 400);
            }

            const { memberships: appwriteMemberships } = await teams.listMemberships(context.org.appwriteTeamId);
            const appwriteMembership = appwriteMemberships.find(membership => membership.userId === targetMembership.userId);

            if (appwriteMembership?.$id) {
                await teams.deleteMembership(context.org.appwriteTeamId, appwriteMembership.$id);
            }

            await adminDatabases.deleteDocument(
                DATABASE_ID,
                MEMBERSHIPS_ID,
                targetMembership.$id
            );

            return ctx.json({ success: true });
        }
    )

    .patch(
        '/tags',
        zValidator('json', tagsSchema),
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { tag } = ctx.req.valid('json');

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ error: 'No active organization' }, 400);

            const currentTags = context.membership.tags
                ? context.membership.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                : [];

            if (currentTags.includes(tag) || currentTags.length >= 3) {
                return ctx.json({ tags: currentTags.join(',') });
            }

            currentTags.push(tag);
            const newTags = currentTags.join(',');

            await databases.updateDocument(
                DATABASE_ID,
                MEMBERSHIPS_ID,
                context.membership.$id,
                { tags: newTags }
            );

            return ctx.json({ tags: newTags });
        }
    )

    .patch(
        '/profile',
        zValidator('json', profileSchema),
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { position, description, linkedin, tags, birthday, memberSince, currentProject } = ctx.req.valid('json');

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ error: 'No active organization' }, 400);

            await databases.updateDocument(
                DATABASE_ID,
                MEMBERSHIPS_ID,
                context.membership.$id,
                {
                    position: position ?? '',
                    description: description ?? '',
                    linkedin: linkedin ?? '',
                    tags: tags.join(','),
                    birthday: birthday ?? '',
                    memberSince: memberSince ?? '',
                    currentProject: currentProject ?? '',
                }
            );

            return ctx.json({ success: true });
        }
    )

    .patch(
        '/birthday',
        zValidator('json', birthdaySchema),
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { birthday } = ctx.req.valid('json');

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ error: 'No active organization' }, 400);

            await databases.updateDocument(
                DATABASE_ID,
                MEMBERSHIPS_ID,
                context.membership.$id,
                { birthday }
            );

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
            const { users } = await createAdminClient();

            const { email, mode, targetRole } = ctx.req.valid('json');

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ error: 'No active organization' }, 400);

            const token = crypto.randomUUID();

            if (mode === 'existing') {
                const existingUsers = await users.list([
                    Query.equal('email', email),
                    Query.limit(1),
                ]);

                const invitedUser = existingUsers.users[0];

                if (!invitedUser || invitedUser.status === false) {
                    return ctx.json({ errorCode: 'invite-user-not-found' }, 400);
                }

                await databases.createDocument(
                    DATABASE_ID,
                    NOTIFICATIONS_ID,
                    ID.unique(),
                    {
                        userId: invitedUser.$id,
                        triggeredBy: user.$id,
                        title: NotificationI18nKey.ORGANIZATION_INVITE_TITLE,
                        read: false,
                        type: NotificationType.RECURRING,
                        entityType: NotificationEntityType.ORGANIZATION_INVITE,
                        body: `${NotificationI18nKey.ORGANIZATION_INVITE_BODY}${NotificationBodySeparator}${context.org.name}${NotificationBodySeparator}${token}`,
                    }
                );
            }

            await databases.createDocument(
                DATABASE_ID,
                INVITES_ID,
                ID.unique(),
                {
                    token,
                    teamId: context.org.appwriteTeamId,
                    teamName: context.org.name,
                    email,
                    accepted: false,
                    invitedBy: user.$id,
                    userId: user.$id,
                    invitedByName: user.name,
                    targetRole,
                }
            );

            return ctx.json({ invitationUrl: `${NEXT_PUBLIC_APP_URL}/team/join-team/${token}`, token, success: true })
        }
    )

    .get(
        '/join-team/:token',
        async ctx => {
            const token = ctx.req.param('token');

            if (!token) return ctx.json({ error: 'No token provided' }, 400)

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
            const { name, email, password, teamId, inviteId } = ctx.req.valid('json');

            const { account, users, teams, databases } = await createAdminClient();

            let inviteRole = 'CREATOR';
            try {
                const inviteDoc = await databases.getDocument(DATABASE_ID, INVITES_ID, inviteId);
                if (inviteDoc.targetRole) inviteRole = inviteDoc.targetRole as string;
            } catch {
                // fallback to CREATOR if invite not found
            }

            const newUser = await account.create(
                ID.unique(),
                email,
                password,
                name
            );

            await teams.createMembership(
                teamId,
                [inviteRole],
                email,
            );



            await users.updatePrefs(newUser.$id, {
            });

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
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30
            })

            return ctx.json({ success: true })
        }
    )

    .post(
        '/accept-invitation-token',
        zValidator('json', zod.object({ token: zod.string().trim().min(1, 'Required') })),
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const { teams, databases: adminDatabases } = await createAdminClient();
            const { token } = ctx.req.valid('json');

            const invites = await adminDatabases.listDocuments(
                DATABASE_ID,
                INVITES_ID,
                [
                    Query.equal('token', token),
                    Query.equal('accepted', false),
                    Query.equal('email', user.email),
                    Query.limit(1),
                ]
            );

            if (invites.total === 0) {
                return ctx.json({ error: 'Invalid invitation token' }, 400);
            }

            const invite = invites.documents[0];

            const organizations = await adminDatabases.listDocuments<Organization>(
                DATABASE_ID,
                ORGANIZATIONS_ID,
                [
                    Query.equal('appwriteTeamId', invite.teamId),
                    Query.limit(1),
                ]
            );

            if (organizations.total === 0) {
                return ctx.json({ error: 'Organization not found' }, 400);
            }

            const organization = organizations.documents[0];

            const existingMemberships = await adminDatabases.listDocuments<Membership>(
                DATABASE_ID,
                MEMBERSHIPS_ID,
                [
                    Query.equal('userId', user.$id),
                    Query.equal('organizationId', organization.$id),
                    Query.limit(1),
                ]
            );

            let membershipId = existingMemberships.documents[0]?.$id;

            if (!membershipId) {
                await adminDatabases.createDocument(
                    DATABASE_ID,
                    MEMBERSHIPS_ID,
                    ID.unique(),
                    {
                        userId: user.$id,
                        organizationId: organization.$id,
                        role: (invite.targetRole as string) || 'CREATOR',
                    }
                );

                const createdMemberships = await adminDatabases.listDocuments<Membership>(
                    DATABASE_ID,
                    MEMBERSHIPS_ID,
                    [
                        Query.equal('userId', user.$id),
                        Query.equal('organizationId', organization.$id),
                        Query.orderDesc('$createdAt'),
                        Query.limit(1),
                    ]
                );

                membershipId = createdMemberships.documents[0]?.$id;
            }

            try {
                const { memberships: teamMemberships } = await teams.listMemberships(organization.appwriteTeamId);
                const alreadyTeamMember = teamMemberships.some(member => member.userId === user.$id);

                if (!alreadyTeamMember) {
                    await teams.createMembership(organization.appwriteTeamId, [(invite.targetRole as string) || 'CREATOR'], user.email);
                }
            } catch {
                // No-op: app access is driven by DB memberships; this should not block token acceptance
            }

            await adminDatabases.updateDocument(
                DATABASE_ID,
                INVITES_ID,
                invite.$id,
                { accepted: true }
            );

            if (!membershipId) {
                return ctx.json({ error: 'Membership could not be created' }, 500);
            }

            const isSecure = process.env.NODE_ENV === 'production';
            setCookie(ctx, 'active-org-id', membershipId, {
                path: '/',
                httpOnly: true,
                secure: isSecure,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 365
            });

            return ctx.json({ success: true });
        }
    )

    .patch(
        '/edit-name',
        zValidator('json', companyNameSchema),
        sessionMiddleware,
        async ctx => {
            const { company } = ctx.req.valid('json');

            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { teams } = await createAdminClient();

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ error: 'No active organization' }, 400);

            await teams.updateName(context.org.appwriteTeamId, company);

            await databases.updateDocument(
                DATABASE_ID,
                ORGANIZATIONS_ID,
                context.org.$id,
                { name: company }
            );

            return ctx.json({ success: true })
        }
    )

    .post(
        '/cancel-subscription',
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ error: 'No active organization' }, 400);

            if (context.membership.role !== 'OWNER') {
                return ctx.json({ error: 'Only owners can cancel subscriptions' }, 403);
            }

            if (!context.org.stripeSubscriptionId) {
                return ctx.json({ error: 'No active subscription for this organization' }, 400);
            }

            const stripe = new Stripe(STRIPE_SECRET_KEY);
            const subscription = await stripe.subscriptions.update(context.org.stripeSubscriptionId, {
                cancel_at_period_end: true,
            }) as Stripe.Subscription;

            await databases.updateDocument(
                DATABASE_ID,
                ORGANIZATIONS_ID,
                context.org.$id,
                {
                    subscriptionStatus: 'canceling',
                    cancelAtPeriodEnd: true,
                    nextRenewal: new Date((subscription as Stripe.Subscription & { current_period_end: number }).current_period_end * 1000).toISOString(),
                }
            );

            return ctx.json({ success: true });
        }
    )

    .post(
        '/reactivate-subscription',
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ error: 'No active organization' }, 400);

            if (context.membership.role !== 'OWNER') {
                return ctx.json({ error: 'Only owners can reactivate subscriptions' }, 403);
            }

            if (!context.org.stripeSubscriptionId) {
                return ctx.json({ error: 'No subscription to reactivate' }, 400);
            }

            if (context.org.subscriptionStatus !== 'canceling') {
                return ctx.json({ error: 'Subscription is not pending cancellation' }, 400);
            }

            const stripe = new Stripe(STRIPE_SECRET_KEY);
            await stripe.subscriptions.update(context.org.stripeSubscriptionId, {
                cancel_at_period_end: false,
            });

            await databases.updateDocument(
                DATABASE_ID,
                ORGANIZATIONS_ID,
                context.org.$id,
                {
                    subscriptionStatus: 'active',
                    cancelAtPeriodEnd: false,
                }
            );

            return ctx.json({ success: true });
        }
    )

    .post(
        '/billing-portal',
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ error: 'No active organization' }, 400);

            if (context.membership.role !== 'OWNER') {
                return ctx.json({ error: 'Only owners can access billing portal' }, 403);
            }

            if (!context.org.stripeCustomerId) {
                return ctx.json({ error: 'No billing account found' }, 400);
            }

            const stripe = new Stripe(STRIPE_SECRET_KEY);
            const session = await stripe.billingPortal.sessions.create({
                customer: context.org.stripeCustomerId,
                return_url: `${NEXT_PUBLIC_APP_URL}/organization`,
            });

            return ctx.json({ url: session.url });
        }
    )
    .put(
        '/change-plan',
        sessionMiddleware,
        zValidator('json', zod.object({
            plan: zod.enum(['plus', 'pro']),
            billing: zod.enum(['monthly', 'annual']).optional().default('monthly'),
        })),
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { plan, billing } = ctx.req.valid('json');

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ error: 'No active organization' }, 400);
            if (context.membership.role !== 'OWNER') return ctx.json({ error: 'Only owners can change plans' }, 403);

            const org = context.org;
            const stripe = new Stripe(STRIPE_SECRET_KEY);

            const products = await stripe.products.list();
            const product = products.data.find(p => p.metadata.plan === plan);
            if (!product?.default_price) return ctx.json({ error: 'Plan not found in Stripe' }, 400);

            const newPriceId = product.default_price.toString();
            const planUppercase: OrganizationPlan = plan === 'pro' ? 'PRO' : 'PLUS';
            const billingCycle: BillingCycle = billing === 'annual' ? 'YEARLY' : 'MONTHLY';

            // Paid → paid: update subscription directly (Stripe handles proration)
            if (org.stripeSubscriptionId) {
                const subscription = await stripe.subscriptions.retrieve(org.stripeSubscriptionId);
                const currentItemId = subscription.items.data[0]?.id;
                if (!currentItemId) return ctx.json({ error: 'Subscription item not found' }, 400);

                const updatedSub = await stripe.subscriptions.update(org.stripeSubscriptionId, {
                    items: [{ id: currentItemId, price: newPriceId }],
                    proration_behavior: 'create_prorations',
                }) as unknown as Stripe.Subscription & { current_period_end: number };

                await databases.updateDocument(
                    DATABASE_ID, ORGANIZATIONS_ID, org.$id,
                    {
                        plan: planUppercase,
                        billingCycle,
                        subscriptionStatus: updatedSub.status,
                        nextRenewal: new Date(updatedSub.current_period_end * 1000).toISOString(),
                    }
                );

                return ctx.json({ success: true });
            }

            // FREE → paid: create Stripe Checkout linking existing customer if available
            const sessionParams: Stripe.Checkout.SessionCreateParams = {
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [{ price: newPriceId, quantity: 1 }],
                metadata: { plan, billing },
                success_url: `${NEXT_PUBLIC_APP_URL}/organization?upgraded=true&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${NEXT_PUBLIC_APP_URL}/organization`,
            };

            if (org.stripeCustomerId) {
                sessionParams.customer = org.stripeCustomerId;
            }

            const session = await stripe.checkout.sessions.create(sessionParams);
            return ctx.json({ url: session.url });
        }
    )

    .post(
        '/finalize-upgrade',
        sessionMiddleware,
        zValidator('json', zod.object({ sessionId: zod.string().trim().min(1) })),
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { sessionId } = ctx.req.valid('json');

            const context = await getActiveContext(user, databases, ctx.get('activeOrgId'));
            if (!context) return ctx.json({ error: 'No active organization' }, 400);
            if (context.membership.role !== 'OWNER') return ctx.json({ error: 'Only owners can upgrade plans' }, 403);

            const stripe = new Stripe(STRIPE_SECRET_KEY);
            const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
                expand: ['customer', 'subscription'],
            });

            if (checkoutSession.payment_status !== 'paid') {
                return ctx.json({ error: 'Payment not confirmed' }, 400);
            }

            const getStripeId = (val: string | { id: string } | null | undefined): string | undefined => {
                if (!val) return undefined;
                return typeof val === 'string' ? val : val.id;
            };

            const stripeCustomerId = getStripeId(checkoutSession.customer as string | { id: string } | null);
            const subscription = checkoutSession.subscription;
            const stripeSubscriptionId = getStripeId(subscription as string | { id: string } | null);

            if (!stripeSubscriptionId) return ctx.json({ error: 'No subscription found in session' }, 400);

            const fullSub = await stripe.subscriptions.retrieve(stripeSubscriptionId) as unknown as Stripe.Subscription & { current_period_end: number };

            const planMeta = checkoutSession.metadata?.plan ?? 'plus';
            const billingMeta = checkoutSession.metadata?.billing ?? 'monthly';
            const planUppercase: OrganizationPlan = planMeta === 'pro' ? 'PRO' : 'PLUS';
            const billingCycle: BillingCycle = billingMeta === 'annual' ? 'YEARLY' : 'MONTHLY';

            let paymentMethodLast4: string | undefined;
            const effectiveCustomerId = stripeCustomerId ?? context.org.stripeCustomerId;
            if (effectiveCustomerId) {
                try {
                    const pms = await stripe.paymentMethods.list({ customer: effectiveCustomerId, type: 'card', limit: 1 });
                    paymentMethodLast4 = pms.data[0]?.card?.last4;
                } catch { /* non-critical */ }
            }

            await databases.updateDocument(
                DATABASE_ID, ORGANIZATIONS_ID, context.org.$id,
                {
                    plan: planUppercase,
                    billingCycle,
                    subscriptionStatus: fullSub.status,
                    stripeCustomerId: stripeCustomerId ?? context.org.stripeCustomerId,
                    stripeSubscriptionId,
                    nextRenewal: new Date(fullSub.current_period_end * 1000).toISOString(),
                    cancelAtPeriodEnd: false,
                    ...(paymentMethodLast4 ? { paymentMethodLast4 } : {}),
                }
            );

            return ctx.json({ success: true });
        }
    )
export default app;