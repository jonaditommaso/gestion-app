import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api['home-config']['$post'], 200>
type RequestType = InferRequestType<typeof client.api['home-config']['$post']>

export const useUpdateHomeConfig = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('home');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api['home-config']['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to update home config')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('config-saved'))
            queryClient.invalidateQueries({ queryKey: ['home-config'] })
        },
        onError: () => {
            toast.error(t('failed-save-config'))
        }
    })
    return mutation
}
