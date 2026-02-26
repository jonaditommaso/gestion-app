import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { Membership, Organization } from "../types";

type OrgContext = {
    membership: Membership;
    org: Organization;
};

type TeamContextData = {
    membership: Membership;
    org: Organization;
    allContexts: OrgContext[];
};

export const useGetTeamContext = () => {
    const query = useQuery({
        queryKey: ['team', 'context'],
        queryFn: async () => {
            const response = await client.api.team.context.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch team context');
            }

            const { data } = await response.json();

            return data as TeamContextData | null;
        }
    });

    return query;
};
