import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = { qr: string };

export const useGetMfaQr = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('settings')

    const mutation = useMutation<ResponseType, Error, void>({
        mutationFn: async () => {
            const response = await client.api.settings['mfa-qr']['$post']();

            if(!response.ok) {
                throw new Error('Failed getting MFA QR')
            }

            return await response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mfa-qr'] })
        },
        onError: () => {
            toast.error(t('failed-get-mfa-qr'))
        }
    })
    return mutation
}