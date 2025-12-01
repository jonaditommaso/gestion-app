import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.tasks.share.bulk['$post']>
type RequestType = InferRequestType<typeof client.api.tasks.share.bulk['$post']>

export const useBulkCreateTaskShare = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.tasks.share.bulk['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to create bulk task share')
            }

            return await response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task-shares'] })
            toast.success(t('task-shared-successfully'))
        },
        onError: () => {
            toast.error(t('error-sharing-task'))
        }
    })
    return mutation
}
