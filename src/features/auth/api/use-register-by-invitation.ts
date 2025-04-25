import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.team['join-team']['$post']>
type RequestType = InferRequestType<typeof client.api.team['join-team']['$post']>

export const useRegisterByInvitation = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json}) => {
            const response = await client.api.team['join-team']['$post']({ json });

            if(!response.ok) {
                throw new Error('Failed to register')
            }

            return await response.json()
        },
        onSuccess: async () => {
            toast.success('Cuenta creada con éxito');
            window.location.href = '/'
            queryClient.invalidateQueries({ queryKey: ['current'] })
        },
        onError: () => {
            toast.error('Lo sentimos, hubo un error al crear la cuenta')
        }
    })
    return mutation
}