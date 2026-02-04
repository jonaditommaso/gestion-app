import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetArchivedTasksProps {
    workspaceId: string;
    enabled?: boolean;
}

export const useGetArchivedTasks = ({ workspaceId, enabled = true }: UseGetArchivedTasksProps) => {
    const query = useQuery({
        queryKey: ['archived-tasks', workspaceId],
        queryFn: async () => {
            const response = await client.api.tasks.$get({
                query: {
                    workspaceId,
                    archived: 'true',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch archived tasks');
            }

            const data = await response.json();

            return data.data;
        },
        enabled: enabled && !!workspaceId,
    });

    return query;
};
