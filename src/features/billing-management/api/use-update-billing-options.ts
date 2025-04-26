import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.billing['options'][':billingOptionId']['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.billing['options'][':billingOptionId']['$patch']>

export const useUpdateBillingOptions = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('billing');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json, param}) => {
            const response = await client.api.billing['options'][':billingOptionId']['$patch']({ json, param });

            if(!response.ok) {
                throw new Error('Failed to update options')
            }

            return await response.json()
        },
        onSuccess: ({ data }) => {
            toast.success(t('option-updated'))
            queryClient.invalidateQueries({ queryKey: ['billing-options'] })
            queryClient.invalidateQueries({ queryKey: ['billing-options', data.$id] })
        },
        onError: () => {
            toast.error(t('failed-update-options'))
        }
    })
    return mutation
}