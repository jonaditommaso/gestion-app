import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRef } from "react";

type ResponseType = InferResponseType<typeof client.api.auth.register['$post']>
type RequestType = InferRequestType<typeof client.api.auth.register['$post']>

export const useRegister = (options?: { onSuccess?: () => void }) => {
    const router = useRouter()
    const queryClient = useQueryClient();
    const t = useTranslations('auth');

    const onSuccessRef = useRef(options?.onSuccess);
    onSuccessRef.current = options?.onSuccess;

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.auth.register['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to register')
            }

            return await response.json()
        },
        onSuccess: (data) => {
            toast.success(t('account-created'))
            queryClient.invalidateQueries({ queryKey: ['current'] })
            if (onSuccessRef.current) {
                onSuccessRef.current();
            } else if ('isDemo' in data && data.isDemo) {
                router.push('/');
            } else {
                router.push('/onboarding');
            }
        },
        onError: () => {
            toast.error(t('sorry-failed-delete-account'))
        }
    })
    return mutation
}