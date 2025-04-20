import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.team.tags['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.team.tags['$patch']>

export const useAddMemberTag = () => {
    const router = useRouter()
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json }) => {
            const response = await client.api.team.tags['$patch']({ json });

            if(!response.ok) {
                throw new Error('Failed to create tag')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success('Tag agregado con éxito')
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['member-tag'] })
        },
        onError: () => {
            toast.error('Lo sentimos, hubo un error creando el tag')
        }
    })
    return mutation
}