import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { PopulatedChecklistItem } from "../types";

type ResponseType = InferResponseType<typeof client.api.checklist['convert-to-task']['$post']>;
type RequestType = InferRequestType<typeof client.api.checklist['convert-to-task']['$post']>;

interface UseConvertToTaskProps {
    taskId: string;
}

interface ChecklistQueryData {
    documents: PopulatedChecklistItem[];
    total: number;
}

export const useConvertToTask = ({ taskId }: UseConvertToTaskProps) => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, RequestType, { previousData: ChecklistQueryData | undefined }>({
        mutationFn: async ({ json }) => {
            const response = await client.api.checklist['convert-to-task']['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to convert to task');
            }

            return await response.json();
        },
        onMutate: async ({ json }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['checklist', taskId] });

            // Snapshot the previous value
            const previousData = queryClient.getQueryData<ChecklistQueryData>(['checklist', taskId]);

            // Optimistically remove the item from the list
            if (previousData) {
                const updatedDocuments = previousData.documents.filter(
                    item => item.$id !== json.itemId
                );
                queryClient.setQueryData<ChecklistQueryData>(['checklist', taskId], {
                    documents: updatedDocuments,
                    total: updatedDocuments.length
                });
            }

            // Return context with the previous data for rollback
            return { previousData };
        },
        onSuccess: () => {
            toast.success(t('checklist-item-converted'));
            // Invalidate to ensure consistency with server
            queryClient.invalidateQueries({ queryKey: ['checklist', taskId] });
            queryClient.invalidateQueries({ queryKey: ['checklist-progress', taskId] });
            // Invalidate task queries to update checklistCompletedCount and show new task
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
        onError: (_error, _variables, context) => {
            // Rollback to the previous data on error
            if (context?.previousData) {
                queryClient.setQueryData(['checklist', taskId], context.previousData);
            }
            toast.error(t('checklist-error-convert'));
        }
    });

    return mutation;
};
