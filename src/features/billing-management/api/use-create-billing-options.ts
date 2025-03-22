import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.billing.options['$post']>
type RequestType = InferRequestType<typeof client.api.billing.options['$post']>

export const useCreateBillingOptions = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json }) => {
            const response = await client.api.billing.options['$post']({ json});

            if(!response.ok) {
                throw new Error('Failed to update options')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success('Opcion actualizada')
            queryClient.invalidateQueries({ queryKey: ['billing-options'] })
        },
        onError: () => {
            toast.error('Hubo un error actualizando las opciones')
        }
    })
    return mutation
}