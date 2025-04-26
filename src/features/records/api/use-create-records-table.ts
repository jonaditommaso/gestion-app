import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.records['records-table']['$post']>
type RequestType = InferRequestType<typeof client.api.records['records-table']['$post']>

export const useCreateRecordsTable = () => {
    const router = useRouter()
    const queryClient = useQueryClient();
    const t = useTranslations('records');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json }) => {
            const response = await client.api.records['records-table']['$post']({ json });

            if(!response.ok) {
                throw new Error('Failed to create records table')
            }

            return await response.json()
        },
        onSuccess: ({ data }) => {
            toast.success(t('table-created'))
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['tables'] })
            queryClient.invalidateQueries({ queryKey: ['table', data.$id] })
        },
        onError: () => {
            toast.error(t('failed-create-table'))
        }
    })
    return mutation
}