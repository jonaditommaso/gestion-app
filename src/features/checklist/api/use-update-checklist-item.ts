import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.checklist[':itemId']['$patch']>;
type RequestType = InferRequestType<typeof client.api.checklist[':itemId']['$patch']>;

interface UseUpdateChecklistItemProps {
    taskId: string;
}

export const useUpdateChecklistItem = ({ taskId }: UseUpdateChecklistItemProps) => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, RequestType>({
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checklist', taskId] });
            queryClient.invalidateQueries({ queryKey: ['checklist-progress', taskId] });
            // Invalidate task queries to update checklistCompletedCount
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
        onError: () => {
            toast.error(t('checklist-error-update'));
        }
    });

    return mutation;
};
