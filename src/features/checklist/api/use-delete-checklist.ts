import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.checklist.all['$delete']>;
type RequestType = InferRequestType<typeof client.api.checklist.all['$delete']>;

interface UseDeleteChecklistProps {
    taskId: string;
}

export const useDeleteChecklist = ({ taskId }: UseDeleteChecklistProps) => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.checklist.all['$delete']({ json });

            if (!response.ok) {
                throw new Error('Failed to delete checklist');
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success(t('checklist-deleted'));
            queryClient.invalidateQueries({ queryKey: ['checklist', taskId] });
            queryClient.invalidateQueries({ queryKey: ['checklist-progress', taskId] });
            // Invalidate task queries to update checklistCount/checklistCompletedCount/checklistTitle
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
        onError: () => {
            toast.error(t('checklist-error-delete-all'));
        }
    });

    return mutation;
};
