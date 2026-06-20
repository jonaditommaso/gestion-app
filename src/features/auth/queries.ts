import { cache } from 'react';
import { createSessionClient } from "@/lib/appwrite"
import { cookies } from 'next/headers';

export const getCurrent = cache(async () => {
    try {
        const { account } = await createSessionClient();

        const user = await account.get();
        const { identities } = await account.listIdentities();

        const providers = identities.map(i => i.provider);

        const currentUser = { ...user, authProviders: providers, isOAuth: providers.length > 0 && providers[0] !== 'password' };

        return currentUser;

    } catch {
        return null;
    }
})

export const getIsDemoUser = cache(async () => {
    try {
        const cookieStore = await cookies();
        const isDemo = cookieStore.get('isDemo')?.value === 'true';
        return isDemo;
    } catch {
        return false;
    }
});

export const getCurrentSession = cache(async () => {
    try {
        const user = await getCurrent();

        const cookieStore = await cookies();
        const isDemo = cookieStore.get('isDemo')?.value === 'true';

        const hasSession = !!user || isDemo;

        return hasSession;

    } catch {
        return null;
    }
})