import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";
import { Task } from "../types";

interface UseGetTaskProps {
    taskId: string;
    enabled?: boolean;
}

export const useGetTask = ({
    taskId,
    enabled = true
}: UseGetTaskProps) => {
    const { isDemo, isLoadingTeamContext } = useAppContext();
    const demoData = useDemoData();
    const queryClient = useQueryClient();

    const cachedTask = (() => {
        if (!taskId) return null;

        const cachedTaskQueries = queryClient.getQueriesData<{ documents?: Task[] }>({
            queryKey: ['tasks'],
        });

        for (const [, value] of cachedTaskQueries) {
            const found = value?.documents?.find((task) => task.$id === taskId);
            if (found) {
                return found;
            }
        }

        return null;
    })();

    const query = useQuery({
        queryKey: ['task', taskId, isDemo],
        queryFn: async () => {
            if (isDemo) {
                const task = demoData.tasks.find(t => t.$id === taskId);
                if (!task) return null;
                return { ...task, assignees: task.assignees ?? [], squads: [] };
            }

            const response = await client.api.tasks[':taskId'].$get({ param: { taskId } });

            if (!response.ok) {
                throw new Error('Failed to fetch task')
            }

            const { data } = await response.json();

            return data;
        },
        initialData: cachedTask,
        enabled: !isLoadingTeamContext && enabled && !!taskId && (isDemo || !cachedTask),
    });

    return query;
}