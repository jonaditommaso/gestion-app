import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.records['records-table'][':tableId']['$delete'], 200>
type RequestType = InferRequestType<typeof client.api.records['records-table'][':tableId']['$delete']>

export const useDeleteRecordsTable = () => {
    const router = useRouter()
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.records['records-table'][':tableId']['$delete']({ param });

            if(!response.ok) {
                throw new Error('Failed to delete records table')
            }

            return await response.json()
        },
        onSuccess: ({ data }) => {
            toast.success('Tabla eliminada con exito')
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['tables'] })
            queryClient.invalidateQueries({ queryKey: ['records-tables'] })
            queryClient.invalidateQueries({ queryKey: ['table', data.$id] })
        },
        onError: () => {
            toast.error('Hubo un error eliminando la tabla')
        }
    })
    return mutation
}