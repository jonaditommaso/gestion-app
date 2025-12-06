import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.checklist.assignees['$post']>;
type RequestType = InferRequestType<typeof client.api.checklist.assignees['$post']>;

interface UseAddChecklistAssigneeProps {
    taskId: string;
}

export const useAddChecklistAssignee = ({ taskId }: UseAddChecklistAssigneeProps) => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.checklist.assignees['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to add assignee');
            }

            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checklist', taskId] });
        },
        onError: () => {
            toast.error(t('failed-add-assignee'));
        }
    });

    return mutation;
};
