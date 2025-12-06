import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { PopulatedChecklistItem } from "../types";

type ResponseType = InferResponseType<typeof client.api.checklist['$post']>;
type RequestType = InferRequestType<typeof client.api.checklist['$post']>;

export const useCreateChecklistItem = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, RequestType, { previousItems: { documents: PopulatedChecklistItem[] } | undefined }>({
        mutationFn: async ({ json }) => {
            const response = await client.api.checklist['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to create checklist item');
            }

            return await response.json();
        },
        onMutate: async ({ json }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['checklist', json.taskId] });

            // Snapshot the previous value
            const previousItems = queryClient.getQueryData<{ documents: PopulatedChecklistItem[] }>(['checklist', json.taskId]);

            // Optimistically update to the new value
            const optimisticItem: PopulatedChecklistItem = {
                $id: `temp-${Date.now()}`,
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                $permissions: [],
                $databaseId: '',
                $collectionId: '',
                taskId: json.taskId,
                workspaceId: json.workspaceId,
                title: json.title,
                completed: false,
                position: json.position ?? 0,
                dueDate: null,
                createdBy: '', // Will be set by the server
                assignees: []
            };

            queryClient.setQueryData<{ documents: PopulatedChecklistItem[] }>(
                ['checklist', json.taskId],
                (old) => ({
                    documents: [...(old?.documents || []), optimisticItem]
                })
            );

            // Return a context object with the snapshotted value
            return { previousItems };
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['checklist', variables.json.taskId] });
            queryClient.invalidateQueries({ queryKey: ['checklist-progress', variables.json.taskId] });
            // Invalidate task queries to update checklistCount
            queryClient.invalidateQueries({ queryKey: ['task', variables.json.taskId] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
        onError: (_, variables, context) => {
            // Rollback to the previous value on error
            if (context?.previousItems) {
                queryClient.setQueryData(['checklist', variables.json.taskId], context.previousItems);
            }
            toast.error(t('checklist-error-create'));
        }
    });

    return mutation;
};
