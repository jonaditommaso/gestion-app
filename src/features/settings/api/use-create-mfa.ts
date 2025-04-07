import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.settings['create-mfa']['$post']>
type RequestType = InferRequestType<typeof client.api.settings['create-mfa']['$post']>

export const useCreateMfa = () => {
    const queryClient = useQueryClient();
    const router = useRouter()

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.settings['create-mfa']['$post']({ json });

            if(!response.ok) {
                throw new Error('Failed creating MFA')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success('MFA creado con exito');
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['create-mfa'] })
        },
        onError: (err) => {
            toast.error('Hubo un error creando MFA') // Improve err message giving more info
        }
    })
    return mutation
}