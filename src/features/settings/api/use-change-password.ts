import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.settings['change-password']['$post']>
type RequestType = InferRequestType<typeof client.api.settings['change-password']['$post']>

export const useChangePassword = () => {
    const t = useTranslations('settings');
    const router = useRouter();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.settings['change-password']['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed changing password');
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success(t('password-updated'));
            router.refresh();
        },
        onError: () => {
            toast.error(t('failed-update-password'));
        }
    });

    return mutation;
}
