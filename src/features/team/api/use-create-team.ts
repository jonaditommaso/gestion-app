import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRef } from "react";

type ResponseType = InferResponseType<typeof client.api.team.create['$post'], 200>
type RequestType = InferRequestType<typeof client.api.team.create['$post']>

export const useCreateTeam = (options?: { onSuccess?: () => void }) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const t = useTranslations('onboarding');

    const onSuccessRef = useRef(options?.onSuccess);
    onSuccessRef.current = options?.onSuccess;

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.team.create['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to create team');
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success(t('team-created'));
            queryClient.invalidateQueries({ queryKey: ['current'] });
            queryClient.invalidateQueries({ queryKey: ['team'] });
            if (onSuccessRef.current) {
                onSuccessRef.current();
            } else {
                router.push('/');
            }
        },
        onError: () => {
            toast.error(t('team-create-error'));
        },
    });

    return mutation;
};
