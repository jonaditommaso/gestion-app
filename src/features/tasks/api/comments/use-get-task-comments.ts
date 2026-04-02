import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";

interface UseGetTaskCommentsProps {
    taskId: string;
    enabled?: boolean;
}

export const useGetTaskComments = ({
    taskId,
    enabled = true
}: UseGetTaskCommentsProps) => {
    const { isDemo, isLoadingUser } = useAppContext();

    const query = useQuery({
        queryKey: ['task-comments', taskId, isDemo],
        queryFn: async () => {
            if (isDemo) return { total: 0, documents: [] };

            const response = await client.api.comments.$get({
                query: { taskId }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch task comments')
            }

            const { data } = await response.json();

            return data;
        },
        enabled: !isLoadingUser && enabled && !!taskId
    })

    return query;
}
