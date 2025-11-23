import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { TaskStatus } from "../types";

interface UseGetTasksProps {
    workspaceId: string,
    status?: TaskStatus | null,
    assigneeId?: string | null,
    dueDate?: string | null,
    search?: string | null,
    priority?: number | null
}

export const useGetTasks = ({
    workspaceId,
    status,
    assigneeId,
    dueDate,
    search,
    priority
}: UseGetTasksProps) => {
    const query = useQuery({
        queryKey: [
            'tasks',
            workspaceId,
            status,
            assigneeId,
            dueDate,
            search,
            priority
        ],
        queryFn: async () => {
            const response = await client.api.tasks.$get(
                {
                    query: {
                        workspaceId,
                        status: status ?? undefined,
                        assigneeId: assigneeId ?? undefined,
                        dueDate: dueDate ?? undefined,
                        search: search ?? undefined,
                        priority: priority ? String(priority) : undefined
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch tasks')
            }

            const { data } = await response.json();

            return data;
        },
        retry: false,
        refetchOnMount: false
    })

    return query;
}