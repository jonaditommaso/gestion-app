import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.records.upload['$post'], 200>
type RequestType = InferRequestType<typeof client.api.records.upload['$post']>

export const useAddRecords = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const t = useTranslations('records');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.records.upload['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to upload records');
            }

            return await response.json()
        },
        onSuccess: ({ data }) => {
            toast.success(t('records-uploaded'))
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['tables'] })
            queryClient.invalidateQueries({ queryKey: ['records'] })
            queryClient.invalidateQueries({ queryKey: ['table', data.$id] })
        },
        onError: () => {
            toast.error(t('failed-upload-records'))
        }
    })
    return mutation
}