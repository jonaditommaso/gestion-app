import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { PopulatedChecklistItem } from "../types";

type ResponseType = InferResponseType<typeof client.api.checklist[':itemId']['$patch']>;
type RequestType = InferRequestType<typeof client.api.checklist[':itemId']['$patch']>;

interface ChecklistData {
    documents: PopulatedChecklistItem[];
    total: number;
}

interface UseUpdateChecklistItemProps {
    taskId: string;
}

export const useUpdateChecklistItem = ({ taskId }: UseUpdateChecklistItemProps) => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, RequestType, { previousData: ChecklistData | undefined }>({
        mutationFn: async ({ json, param }) => {
            const response = await client.api.checklist[':itemId']['$patch']({
                json,
                param
            });

            if (!response.ok) {
                throw new Error('Failed to update checklist item');
            }

            return await response.json();
        },
        // Optimistic update
        onMutate: async ({ json, param }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['checklist', taskId] });

            // Snapshot previous value
            const previousData = queryClient.getQueryData<ChecklistData>(['checklist', taskId]);

            // Optimistically update the cache
            if (previousData && param?.itemId) {
                queryClient.setQueryData<ChecklistData>(['checklist', taskId], {
                    ...previousData,
                    documents: previousData.documents.map(item => {
                        if (item.$id !== param.itemId) return item;

                        const updatedItem: PopulatedChecklistItem = {
                            ...item,
                            ...(json.title !== undefined && { title: json.title }),
                            ...(json.completed !== undefined && { completed: json.completed }),
                            ...(json.position !== undefined && { position: json.position }),
                        };

                        if (json.dueDate !== undefined) {
                            updatedItem.dueDate = json.dueDate instanceof Date
                                ? json.dueDate.toISOString()
                                : json.dueDate;
                        }

                        return updatedItem;
                    })
                });
            }

            return { previousData };
        },
        onError: (_error, _variables, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(['checklist', taskId], context.previousData);
            }
            toast.error(t('checklist-error-update'));
        },
        onSettled: () => {
            // Refetch after mutation settles to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['checklist', taskId] });
            queryClient.invalidateQueries({ queryKey: ['checklist-progress', taskId] });
            // Invalidate task queries to update checklistCompletedCount
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });

    return mutation;
};
