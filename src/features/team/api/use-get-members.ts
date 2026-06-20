import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { MembershipRole } from "../types";
import { useAppContext } from "@/context/AppContext";
import { DEMO_ORG_MEMBERS } from "@/lib/demo-data";
import { generateRandomCode } from "@/lib/utils";

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
    const { isDemo } = useAppContext();

    const query = useQuery({
        queryKey: ['team', 'member-tag', isDemo],
        // enabled: !isLoadingUser,
        queryFn: async () => {
            if (isDemo) {
                const demoEmail = `user${generateRandomCode(6)}@demo.com`;
                const currentUserMember: TeamMember = {
                    $id: `demo-org-mem-you`,
                    appwriteMembershipId: null,
                    userId: generateRandomCode(10),
                    organizationId: 'demo-org-id',
                    appwriteTeamId: 'demo-team-id',
                    name: 'Demo User',
                    email: demoEmail,
                    status: true,
                    userName: 'Demo User',
                    userEmail: demoEmail,
                    prefs: {
                        role: 'OWNER',
                        position: 'Demo User',
                        description: '',
                        linkedin: '',
                        tags: '',
                        birthday: '',
                        memberSince: new Date().toISOString().slice(0, 10),
                        currentProject: '',
                    },
                };
                return {
                    members: [currentUserMember, ...DEMO_ORG_MEMBERS as TeamMember[]],
                    orgName: 'Demo Company',
                };
            }

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