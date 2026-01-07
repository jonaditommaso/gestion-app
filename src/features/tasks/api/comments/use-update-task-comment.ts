import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.comments[':commentId']['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.comments[':commentId']['$patch']>

export const useUpdateTaskComment = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json, param }) => {
            const response = await client.api.comments[':commentId']['$patch']({ json, param });

            if (!response.ok) {
                throw new Error('Failed to update comment')
            }

            return await response.json()
        },
        onSuccess: ({ data }) => {
            toast.success(t('comment-updated'))
            queryClient.invalidateQueries({ queryKey: ['task-comments', data.taskId] })
        },
        onError: () => {
            toast.error(t('failed-update-comment'))
        }
    })
    return mutation
}
