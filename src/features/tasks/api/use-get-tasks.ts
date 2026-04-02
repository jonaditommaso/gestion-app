import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { TaskStatus } from "../types";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";

interface UseGetTasksProps {
    workspaceId?: string,
    status?: TaskStatus | null,
    statusCustomId?: string | null,
    assigneeId?: string | null,
    squadId?: string | null,
    dueDate?: string | null,
    search?: string | null,
    priority?: number | null,
    label?: string[] | null,
    type?: string | null,
    completed?: string | null,
    limit?: number | null,
    enabled?: boolean
}

export const useGetTasks = ({
    workspaceId,
    status,
    statusCustomId,
    assigneeId,
    squadId,
    dueDate,
    search,
    priority,
    label,
    type,
    completed,
    limit,
    enabled = true
}: UseGetTasksProps) => {
    const { isDemo } = useAppContext();
    const demoData = useDemoData();

    const query = useQuery({
        queryKey: [
            'tasks',
            workspaceId,
            status,
            statusCustomId,
            assigneeId,
            squadId,
            dueDate,
            search,
            priority,
            label,
            type,
            completed,
            limit
        ],
        queryFn: async () => {
            if (isDemo) {
                const docs = demoData.tasks.filter(t => {
                    if (workspaceId && t.workspaceId !== workspaceId) return false;
                    if (status && t.status !== status) return false;
                    return true;
                });
                return { total: docs.length, documents: docs };
            }

            const response = await client.api.tasks.$get(
                {
                    query: {
                        workspaceId: workspaceId!,
                        status: status ?? undefined,
                        statusCustomId: statusCustomId ?? undefined,
                        assigneeId: assigneeId ?? undefined,
                        squadId: squadId ?? undefined,
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
        enabled: isDemo || enabled
    })

    return query;
}