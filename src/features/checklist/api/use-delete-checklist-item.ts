import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.checklist[':itemId']['$delete']>;

interface UseDeleteChecklistItemProps {
    taskId: string;
}

export const useDeleteChecklistItem = ({ taskId }: UseDeleteChecklistItemProps) => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, { itemId: string }>({
        mutationFn: async ({ itemId }) => {
            const response = await client.api.checklist[':itemId']['$delete']({
                param: { itemId }
            });

            if (!response.ok) {
                throw new Error('Failed to delete checklist item');
            }

            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checklist', taskId] });
            queryClient.invalidateQueries({ queryKey: ['checklist-progress', taskId] });
            // Invalidate task queries to update checklistCount/checklistCompletedCount
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
        onError: () => {
            toast.error(t('checklist-error-delete'));
        }
    });

    return mutation;
};
