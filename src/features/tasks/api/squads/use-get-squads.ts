import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";

interface UseGetSquadsProps {
    workspaceId?: string;
    enabled?: boolean;
}

export const useGetSquads = ({ workspaceId, enabled = true }: UseGetSquadsProps) => {
    const { isDemo, isLoadingUser } = useAppContext();

    return useQuery({
        queryKey: ['squads', workspaceId, isDemo],
        queryFn: async () => {
            if (isDemo) {
                return { total: 0, documents: [] };
            }

            const response = await client.api.squads.$get({
                query: { workspaceId: workspaceId! }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch squads');
            }

            const { data } = await response.json();
            return data;
        },
        enabled: !isLoadingUser && enabled && !!workspaceId,
        retry: false,
    });
};
