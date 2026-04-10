import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";

interface UseGetArchivedTasksProps {
    workspaceId: string;
    enabled?: boolean;
}

export const useGetArchivedTasks = ({ workspaceId, enabled = true }: UseGetArchivedTasksProps) => {
    const { isDemo, isLoadingUser } = useAppContext();

    const query = useQuery({
        queryKey: ['archived-tasks', workspaceId, isDemo],
        queryFn: async () => {
            if (isDemo) return { documents: [], total: 0 };

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
        enabled: !isLoadingUser && enabled && !!workspaceId,
    });

    return query;
};
