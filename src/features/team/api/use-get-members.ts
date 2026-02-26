import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { MembershipRole } from "../types";

export type TeamMember = {
    $id: string;
    appwriteMembershipId: string | null;
    userId: string;
    organizationId: string;
    appwriteTeamId: string;
    name: string;
    email: string;
    status: boolean;
    userName: string;
    userEmail: string;
    prefs: {
        image?: string;
        role: MembershipRole;
        position: string;
        description: string;
        linkedin: string;
        tags: string;
        birthday: string;
        memberSince: string;
        currentProject: string;
    };
};

type TeamMembersResponse = {
    data: TeamMember[];
    orgName: string;
};

export const useGetMembers = () => {
    const query = useQuery({
        queryKey: ['team', 'member-tag'],
        queryFn: async () => {
            const response = await client.api.team.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch members')
            }

            const json = await response.json() as TeamMembersResponse;

            return { members: json.data, orgName: json.orgName as string };
        }
    })

    return query;
}