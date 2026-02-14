import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.billing[':billingId']['$delete'], 200>
type RequestType = InferRequestType<typeof client.api.billing[':billingId']['$delete']>

export const useDeleteOperation = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('billing');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.billing[':billingId']['$delete']({ param });

            if (!response.ok) {
                throw new Error('Failed to delete operation')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('operation-deleted'))
            queryClient.invalidateQueries({ queryKey: ['billing'] })
        },
        onError: () => {
            toast.error(t('failed-delete-operation'))
        }
    })

    return mutation
}
