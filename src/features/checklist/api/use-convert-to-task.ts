import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.checklist['convert-to-task']['$post']>;
type RequestType = InferRequestType<typeof client.api.checklist['convert-to-task']['$post']>;

interface UseConvertToTaskProps {
    taskId: string;
}

export const useConvertToTask = ({ taskId }: UseConvertToTaskProps) => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.checklist['convert-to-task']['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to convert to task');
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success(t('checklist-item-converted'));
            queryClient.invalidateQueries({ queryKey: ['checklist', taskId] });
            queryClient.invalidateQueries({ queryKey: ['checklist-progress', taskId] });
            // Invalidate task queries to update checklistCompletedCount and show new task
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
        onError: () => {
            toast.error(t('checklist-error-convert'));
        }
    });

    return mutation;
};
