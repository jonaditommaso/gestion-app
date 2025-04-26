import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.records['records-table'][':tableId']['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.records['records-table'][':tableId']['$patch']>

export const useUpdateRecordsTable = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const t = useTranslations('records');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json, param }) => {
            const response = await client.api.records['records-table'][':tableId']['$patch']({ json, param });

            if(!response.ok) {
                throw new Error('Failed to update table name')
            }

            return await response.json()
        },
        onSuccess: ({ data }) => {
            toast.success(t('table-name-updated'))

            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['tables'] })
            queryClient.invalidateQueries({ queryKey: ['records-tables'] })
            queryClient.invalidateQueries({ queryKey: ['table', data.$id] })
        },
        onError: () => {
            toast.error(t('failed-update-table-name'))
        }
    })
    return mutation
}