import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";

interface UseGetTaskActivityLogsProps {
    taskId: string;
}

export const useGetTaskActivityLogs = ({ taskId }: UseGetTaskActivityLogsProps) => {
    const { isDemo, isLoadingUser } = useAppContext();

    const query = useQuery({
        queryKey: ['task-activity-logs', taskId, isDemo],
        queryFn: async () => {
            if (isDemo) return { total: 0, documents: [] };

            const response = await client.api['activity-logs'].$get({
                query: { taskId }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch activity logs')
            }

            const { data } = await response.json();
            return data;
        },
        enabled: !isLoadingUser && !!taskId
    });

    return query;
};
