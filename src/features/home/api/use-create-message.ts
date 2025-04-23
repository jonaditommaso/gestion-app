import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.messages['$post'], 200>
type RequestType = InferRequestType<typeof client.api.messages['$post']>

export const useCreateMessage = () => {
    const router = useRouter()
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json }) => {
            const response = await client.api.messages['$post']({ json });

            if(!response.ok) {
                throw new Error('Failed to create message')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success('Mensaje creado con éxito')
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['messages'] })
        },
        onError: () => {
            toast.error('Lo sentimos, hubo un error creando el mensaje')
        }
    })
    return mutation
}