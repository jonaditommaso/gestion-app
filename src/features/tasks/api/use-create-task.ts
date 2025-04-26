import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.tasks['$post']>
type RequestType = InferRequestType<typeof client.api.tasks['$post']>

export const useCreateTask = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.tasks['$post']({ json });

            if(!response.ok) {
                throw new Error('Failed to create task')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('task-created'))
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
        },
        onError: () => {
            toast.error(t('failed-create-task'))
        }
    })
    return mutation
}