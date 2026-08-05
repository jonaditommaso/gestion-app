import { Databases, Models, Query } from "node-appwrite";
import { DATABASE_ID, MEMBERSHIPS_ID, ORGANIZATIONS_ID } from "@/config";
import { createAdminClient } from "@/lib/appwrite";
import { Membership, Organization } from "../types";

const contextCache = new Map<
    string,
    {
        promise: Promise<{ membership: Membership; org: Organization } | null>;
        expiresAt: number;
    }
>();

const CONTEXT_CACHE_TTL = 30_000; // 30 secs

export async function getActiveContext(
    user: Models.User<Models.Preferences>,
    _databases: Databases,
    activeMembershipId?: string
): Promise<{ membership: Membership; org: Organization } | null> {

    const cacheKey = `${user.$id}:${activeMembershipId ?? 'default'}`;

    const cached = contextCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
        return cached.promise;
    }

    const promise = (async () => {

        // Use admin client so documents created via admin SDK (demo, join-team) are always readable
        const { databases } = await createAdminClient();

        let membershipId = activeMembershipId;

        if (!membershipId) {
            const result = await databases.listDocuments<Membership>(
                DATABASE_ID,
                MEMBERSHIPS_ID,
                [Query.equal('userId', user.$id), Query.limit(1)]
            );

            if (!result.documents.length) {
                contextCache.delete(cacheKey);
                return null;
            }

            membershipId = result.documents[0].$id as string;
        }

        try {
            const membership = await databases.getDocument<Membership>(
                DATABASE_ID,
                MEMBERSHIPS_ID,
                membershipId
            );

            // Security: verify the membership belongs to the current user,
            // since the active-org-id cookie may have been set by a previous session.
            if (membership.userId !== user.$id) {
                throw new Error('Membership does not belong to current user');
            }

            const org = await databases.getDocument<Organization>(
                DATABASE_ID,
                ORGANIZATIONS_ID,
                membership.organizationId
            );

            return { membership, org };
        } catch {
            // Cookie podría estar desactualizada; fallback al primer membership
            const result = await databases.listDocuments<Membership>(
                DATABASE_ID,
                MEMBERSHIPS_ID,
                [Query.equal('userId', user.$id), Query.limit(1)]
            );

            if (!result.documents.length) {
                contextCache.delete(cacheKey);
                return null;
            }

            const membership = result.documents[0] as Membership;

            const org = await databases.getDocument<Organization>(
                DATABASE_ID,
                ORGANIZATIONS_ID,
                membership.organizationId
            );

            return { membership, org };
        }
    })();

    contextCache.set(cacheKey, {
        promise,
        expiresAt: Date.now() + CONTEXT_CACHE_TTL,
    });

    try {
        return await promise;
    } catch (err) {
        // Si la Promise falla, la sacamos del cache para no dejar una Promise rechazada.
        contextCache.delete(cacheKey);
        throw err;
    }
}
