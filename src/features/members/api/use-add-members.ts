import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.members['$post'], 200>
type RequestType = InferRequestType<typeof client.api.members['$post']>

export const useAddMembers = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.members['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to add members')
            }

            return await response.json()
        },
        onSuccess: ({ added }) => {
            toast.success(`${added} miembro${added > 1 ? 's' : ''} agregado${added > 1 ? 's' : ''}`)
            queryClient.invalidateQueries({ queryKey: ['members'] })
        },
        onError: () => {
            toast.error('Hubo un error agregando los miembros')
        }
    })
    return mutation
}
