import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.messages['bulk-update']['$post'], 200>
type RequestType = InferRequestType<typeof client.api.messages['bulk-update']['$post']>

export const useBulkReadMessages = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.messages['bulk-update']['$post']({ json });

            if(!response.ok) {
                throw new Error('Failed to update messages')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success('Message updated')

            queryClient.invalidateQueries({ queryKey: ['messages'] })
        },
        onError: () => {
            toast.error('Hubo un error actualizando los mensajes')
        }
    })
    return mutation
}