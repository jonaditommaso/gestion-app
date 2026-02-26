import { Databases, Models, Query } from "node-appwrite";
import { DATABASE_ID, MEMBERSHIPS_ID, ORGANIZATIONS_ID } from "@/config";
import { createAdminClient } from "@/lib/appwrite";
import { Membership, Organization } from "../types";

export async function getActiveContext(
    user: Models.User<Models.Preferences>,
    _databases: Databases,
    activeMembershipId?: string
): Promise<{ membership: Membership; org: Organization } | null> {
    // Use admin client so documents created via admin SDK (demo, join-team) are always readable
    const { databases } = await createAdminClient();

    let membershipId = activeMembershipId;

    if (!membershipId) {
        const result = await databases.listDocuments<Membership>(
            DATABASE_ID,
            MEMBERSHIPS_ID,
            [Query.equal('userId', user.$id), Query.limit(1)]
        );
        if (!result.documents.length) return null;
        membershipId = result.documents[0].$id as string;
    }

    try {
        const membership = await databases.getDocument<Membership>(
            DATABASE_ID,
            MEMBERSHIPS_ID,
            membershipId
        );

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
        if (!result.documents.length) return null;
        const membership = result.documents[0] as Membership;
        const org = await databases.getDocument<Organization>(
            DATABASE_ID,
            ORGANIZATIONS_ID,
            membership.organizationId
        );
        return { membership, org };
    }
}
