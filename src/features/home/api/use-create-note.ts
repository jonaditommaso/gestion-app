import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.notes['$post'], 200>
type RequestType = InferRequestType<typeof client.api.notes['$post']>

export const useCreateNote = () => {
    const router = useRouter()
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json }) => {
            const response = await client.api.notes['$post']({ json });

            if(!response.ok) {
                throw new Error('Failed to create note')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success('Nota creada con éxito')
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['notes'] })
        },
        onError: () => {
            toast.error('Lo sentimos, hubo un error creando la nota')
        }
    })
    return mutation
}