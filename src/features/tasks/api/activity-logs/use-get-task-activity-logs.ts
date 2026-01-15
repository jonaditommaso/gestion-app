import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetTaskActivityLogsProps {
    taskId: string;
}

export const useGetTaskActivityLogs = ({ taskId }: UseGetTaskActivityLogsProps) => {
    const query = useQuery({
        queryKey: ['task-activity-logs', taskId],
        queryFn: async () => {
            const response = await client.api['activity-logs'].$get({
                query: { taskId }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch activity logs')
            }

            const { data } = await response.json();
            return data;
        },
        enabled: !!taskId
    });

    return query;
};
