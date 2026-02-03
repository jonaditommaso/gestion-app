import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { TaskStatus } from "../types";

interface UseGetTasksProps {
    workspaceId?: string,
    status?: TaskStatus | null,
    statusCustomId?: string | null, // Para filtrar por custom status específico
    assigneeId?: string | null,
    dueDate?: string | null,
    search?: string | null,
    priority?: number | null,
    label?: string[] | null,
    type?: string | null,
    completed?: string | null,
    limit?: number | null, // Límite de resultados
    enabled?: boolean
}

export const useGetTasks = ({
    workspaceId,
    status,
    statusCustomId,
    assigneeId,
    dueDate,
    search,
    priority,
    label,
    type,
    completed,
    limit,
    enabled = true
}: UseGetTasksProps) => {
    const query = useQuery({
        queryKey: [
            'tasks',
            workspaceId,
            status,
            statusCustomId,
            assigneeId,
            dueDate,
            search,
            priority,
            label,
            type,
            completed,
            limit
        ],
        queryFn: async () => {
            const response = await client.api.tasks.$get(
                {
                    query: {
                        workspaceId: workspaceId!,
                        status: status ?? undefined,
                        statusCustomId: statusCustomId ?? undefined,
                        assigneeId: assigneeId ?? undefined,
                        dueDate: dueDate ?? undefined,
                        search: search ?? undefined,
                        priority: priority ? String(priority) : undefined,
                        label: label && label.length > 0 ? label.join(',') : undefined,
                        type: type ?? undefined,
                        completed: completed ?? undefined,
                        limit: limit ? String(limit) : undefined
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
        refetchOnMount: true,
        enabled
    })

    return query;
}