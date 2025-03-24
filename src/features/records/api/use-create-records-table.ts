import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.records['records-table']['$post']>
type RequestType = InferRequestType<typeof client.api.records['records-table']['$post']>

export const useCreateRecordsTable = () => {
    const router = useRouter()
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json }) => {
            const response = await client.api.records['records-table']['$post']({ json });

            if(!response.ok) {
                throw new Error('Failed to create records table')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success('Tabla creada con éxito')
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['records'] })
        },
        onError: () => {
            toast.error('Lo sentimos, hubo un error al crear la tabla')
        }
    })
    return mutation
}