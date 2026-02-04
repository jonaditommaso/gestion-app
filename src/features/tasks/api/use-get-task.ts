import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetTaskProps {
    taskId: string;
    enabled?: boolean;
}

export const useGetTask = ({
    taskId,
    enabled = true
}: UseGetTaskProps) => {
    const query = useQuery({
        queryKey: ['task', taskId],
        queryFn: async () => {
            const response = await client.api.tasks[':taskId'].$get({ param: { taskId } });

            if (!response.ok) {
                throw new Error('Failed to fetch task')
            }

            const { data } = await response.json();

            return data;
        },
        enabled: enabled && !!taskId
    })

    return query;
}