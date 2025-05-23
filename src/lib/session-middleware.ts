import 'server-only';

import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';

import {
    Client,
    Account,
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
        user: Models.User<Models.Preferences>
    }
}

export const sessionMiddleware = createMiddleware<ContextType>(
    async (ctx, next) => {
        const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)

        const session = getCookie(ctx, AUTH_COOKIE);

        if(!session) {
            return ctx.json({ error: 'Unauthorized' }, 401)
        }

        client.setSession(session);

        const account = new Account(client);
        const databases = new Databases(client);
        const storage = new Storage(client);

        const user = await account.get();

        ctx.set('account', account)
        ctx.set('databases', databases)
        ctx.set('storage', storage)
        ctx.set('user', user)

        await next();
    }
)