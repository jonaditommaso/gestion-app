import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetTaskCommentsProps {
    taskId: string;
    enabled?: boolean;
}

export const useGetTaskComments = ({
    taskId,
    enabled = true
}: UseGetTaskCommentsProps) => {
    const query = useQuery({
        queryKey: ['task-comments', taskId],
        queryFn: async () => {
            const response = await client.api.comments.$get({
                query: { taskId }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch task comments')
            }

            const { data } = await response.json();

            return data;
        },
        enabled: enabled && !!taskId
    })

    return query;
}
