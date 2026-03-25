import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetSquadsProps {
    workspaceId?: string;
    enabled?: boolean;
}

export const useGetSquads = ({ workspaceId, enabled = true }: UseGetSquadsProps) => {
    return useQuery({
        queryKey: ['squads', workspaceId],
        queryFn: async () => {
            const response = await client.api.squads.$get({
                query: { workspaceId: workspaceId! }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch squads');
            }

            const { data } = await response.json();
            return data;
        },
        enabled: enabled && !!workspaceId,
        retry: false,
    });
};
