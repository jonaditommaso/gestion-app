import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.records.upload[':recordId']['$patch']>
type RequestType = InferRequestType<typeof client.api.records.upload[':recordId']['$patch']>

export const useAddRecords = () => {
    const router = useRouter()
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json, param }) => {
            const response = await client.api.records.upload[':recordId']['$patch']({ json, param });

            if(!response.ok) {
                throw new Error('Failed to upload records')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success('Datos subidos con éxito')
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['records'] })
        },
        onError: () => {
            toast.error('Lo sentimos, hubo un error al subir los datos')
        }
    })
    return mutation
}