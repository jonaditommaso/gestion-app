import { createSessionClient } from "@/lib/appwrite"

export const getCurrent = async () => {
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
}