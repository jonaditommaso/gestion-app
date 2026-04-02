import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { DEMO_WORKSPACE_MEMBERS_DATA } from "@/lib/demo-data";

interface UseGetMembersProps {
    workspaceId: string;
    enabled?: boolean;
}

export const useGetMembers = ({
    workspaceId,
    enabled = true
}: UseGetMembersProps) => {
    const { isDemo } = useAppContext();

    const query = useQuery({
        queryKey: ['members', workspaceId],
        enabled: isDemo || enabled,
        queryFn: async () => {
            if (isDemo) return DEMO_WORKSPACE_MEMBERS_DATA;

            const response = await client.api.members.$get({ query: { workspaceId } });

            if (!response.ok) {
                throw new Error('Failed to fetch members')
            }

            const { data } = await response.json();

            return data;
        }
    })

    return query;
}