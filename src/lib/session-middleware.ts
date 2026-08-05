import 'server-only';

import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';

import {
    Client,
    Account,
    AppwriteException,
    Databases,
    Storage,
    Models,
    type Account as AccountType,
    type Storage as StorageType,
    type Users as UsersType,
    type Databases as DatabasesType
} from 'node-appwrite';
import { AUTH_COOKIE } from '@/features/auth/constants';

export type ContextType = {
    Variables: {
        account: AccountType,
        databases: DatabasesType,
        storage: StorageType,
        users: UsersType,
        user: Models.User<Models.Preferences>,
        activeOrgId: string | undefined
    }
}

const sessionUserCache = new Map<
    string,
    {
        promise: Promise<Models.User<Models.Preferences>>;
        expiresAt: number;
    }
>();

const SESSION_USER_CACHE_TTL = 30_000; // 30 secs

export const sessionMiddleware = createMiddleware<ContextType>(
    async (ctx, next) => {
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)

        const session = getCookie(ctx, AUTH_COOKIE);

        if (!session) {
            return ctx.json({ error: 'Unauthorized' }, 401)
        }

        client.setSession(session);

        const account = new Account(client);
        const databases = new Databases(client);
        const storage = new Storage(client);

        let user: Models.User<Models.Preferences>;

        const cached = sessionUserCache.get(session);

        if (cached && cached.expiresAt > Date.now()) {
            user = await cached.promise;
        } else {

            const promise = (async () => {

                const currentUser = await account.get();

                return currentUser;
            })();

            sessionUserCache.set(session, {
                promise,
                expiresAt: Date.now() + SESSION_USER_CACHE_TTL,
            });

            try {
                user = await promise;
            } catch (error) {
                sessionUserCache.delete(session);

                if (
                    error instanceof AppwriteException &&
                    error.type === 'user_more_factors_required'
                ) {
                    return ctx.json({ error: 'MFA_REQUIRED' }, 401);
                }

                return ctx.json({ error: 'Unauthorized' }, 401);
            }
        }

        ctx.set('account', account)
        ctx.set('databases', databases)
        ctx.set('storage', storage)
        ctx.set('user', user)
        ctx.set('activeOrgId', getCookie(ctx, 'active-org-id') ?? undefined)

        await next();
    }
)

export const demoGuard = createMiddleware<ContextType>(
    async (ctx, next) => {
        const user = ctx.get('user');
        if (user?.prefs?.isDemo === true) {
            return ctx.json({ error: 'demo_not_allowed' }, 403);
        }
        await next();
    }
)

export const sessionMfaMiddleware = createMiddleware<ContextType>(
    async (ctx, next) => {
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)

        const session = getCookie(ctx, AUTH_COOKIE);

        if (!session) {
            return ctx.json({ error: 'Unauthorized' }, 401)
        }

        client.setSession(session);

        const account = new Account(client);
        const databases = new Databases(client);
        const storage = new Storage(client);

        ctx.set('account', account)
        ctx.set('databases', databases)
        ctx.set('storage', storage)

        await next();
    }
)