import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type CancelSubscriptionPost = typeof client.api.team['cancel-subscription']['$post'];
type ResponseType = InferResponseType<CancelSubscriptionPost, 200>;

export const useCancelSubscription = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('organization');

    return useMutation<ResponseType, Error>({
        mutationFn: async () => {
            const response = await client.api.team['cancel-subscription'].$post();

            if (!response.ok) {
                throw new Error('Failed to cancel subscription');
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success(t('subscription-cancel-scheduled'));
            queryClient.invalidateQueries({ queryKey: ['team', 'context'] });
        },
        onError: () => {
            toast.error(t('subscription-cancel-error'));
        },
    });
};
