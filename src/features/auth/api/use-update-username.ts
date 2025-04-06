import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.auth['update-username']['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.auth['update-username']['$patch']>

export const useUpdateUsername = () => {
    const queryClient = useQueryClient();
    const router = useRouter()

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.auth['update-username']['$patch']({ json });

            if(!response.ok) {
                throw new Error('Failed to update username')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success('Username updated')

            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['current'] })
        },
        onError: () => {
            toast.error('Hubo un error actualizando el nombre de usuario')
        }
    })
    return mutation
}