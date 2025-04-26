import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.messages['$post'], 200>
type RequestType = InferRequestType<typeof client.api.messages['$post']>

export const useCreateMessage = () => {
    const router = useRouter()
    const queryClient = useQueryClient();
    const t = useTranslations('home');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json }) => {
            const response = await client.api.messages['$post']({ json });

            if(!response.ok) {
                throw new Error('Failed to create message')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('message-created'))
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['messages'] })
        },
        onError: () => {
            toast.error(t('failed-create-message'))
        }
    })
    return mutation
}