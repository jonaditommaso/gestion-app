import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Task } from "../types";

type ResponseType = InferResponseType<typeof client.api.tasks['$post']>
type RequestType = InferRequestType<typeof client.api.tasks['$post']>

interface DuplicateTaskProps {
    task: Task;
}

export const useDuplicateTask = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, DuplicateTaskProps>({
        mutationFn: async ({ task }) => {
            // Preparar los datos para la nueva tarea (copia de la original)
            const duplicateData: RequestType['json'] = {
                workspaceId: task.workspaceId,
                name: `${task.name} (${t('copy')})`,
                description: task.description,
                status: task.status,
                statusCustomId: task.statusCustomId || undefined,
                priority: task.priority ?? 3,
                type: task.type || 'task',
                label: task.label || undefined,
                dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                metadata: task.metadata || undefined,
                assigneesIds: task.assignees?.map(a => a.$id) || [],
            };

            const response = await client.api.tasks.$post({ json: duplicateData });

            if (!response.ok) {
                throw new Error('Failed to duplicate task');
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success(t('task-duplicated'));
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
        onError: () => {
            toast.error(t('failed-duplicate-task'));
        }
    });

    return mutation;
};
