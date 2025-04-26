import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.landing['request-enterprise']['$post'], 200>
type RequestType = InferRequestType<typeof client.api.landing['request-enterprise']['$post']>

export const useRequestEnterprisePlan = () => {
    const router = useRouter()
    const queryClient = useQueryClient();
    const t = useTranslations('landing');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json }) => {
            const response = await client.api.landing['request-enterprise']['$post']({ json });

            if(!response.ok) {
                throw new Error('Failed to create request')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('message-created'))
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['pricing'] })
        },
        onError: () => {
            toast.error(t('failed-create-message'))
        }
    })
    return mutation
}