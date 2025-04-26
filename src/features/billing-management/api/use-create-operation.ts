import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.billing['$post']>
type RequestType = InferRequestType<typeof client.api.billing['$post']>

export const useCreateOperation = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('billing');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json}) => {
            const response = await client.api.billing['$post']({ json });

            if(!response.ok) {
                throw new Error('Failed to create operation')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('operation-created'))
            queryClient.invalidateQueries({ queryKey: ['billing'] })
        },
        onError: () => {
            toast.error(t('failed-create-operation'))
        }
    })
    return mutation
}