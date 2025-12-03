import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.checklist.assignees[':itemId'][':workspaceMemberId']['$delete']>;

interface UseRemoveChecklistAssigneeProps {
    taskId: string;
}

export const useRemoveChecklistAssignee = ({ taskId }: UseRemoveChecklistAssigneeProps) => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, { itemId: string; workspaceMemberId: string }>({
        mutationFn: async ({ itemId, workspaceMemberId }) => {
            const response = await client.api.checklist.assignees[':itemId'][':workspaceMemberId']['$delete']({
                param: { itemId, workspaceMemberId }
            });

            if (!response.ok) {
                throw new Error('Failed to remove assignee');
            }

            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checklist', taskId] });
        },
        onError: () => {
            toast.error(t('failed-remove-assignee'));
        }
    });

    return mutation;
};
