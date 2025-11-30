import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.tasks.share['$post']>
type RequestType = InferRequestType<typeof client.api.tasks.share['$post']>

export const useCreateTaskShare = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.tasks.share['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to create task share')
            }

            return await response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task-shares'] })
        },
        onError: () => {
            toast.error(t('error-sharing-task'))
        }
    })
    return mutation
}
