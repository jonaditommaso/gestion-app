import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";

interface UseGetTaskProps {
    taskId: string;
    enabled?: boolean;
}

export const useGetTask = ({
    taskId,
    enabled = true
}: UseGetTaskProps) => {
    const { isDemo, isLoadingUser } = useAppContext();
    const demoData = useDemoData();

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
        enabled: !isLoadingUser && enabled && !!taskId
    })

    return query;
}