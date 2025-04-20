import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.team.birthday['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.team.birthday['$patch']>

export const useUpdateBirthday = () => {
    const router = useRouter()
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json }) => {
            const response = await client.api.team.birthday['$patch']({ json });

            if(!response.ok) {
                throw new Error('Failed to update birthday')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success('Cumpleaños actualizado con éxito')
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['team', 'birthday'] })
        },
        onError: () => {
            toast.error('Lo sentimos, hubo un error actualizando el cumpleaños')
        }
    })
    return mutation
}