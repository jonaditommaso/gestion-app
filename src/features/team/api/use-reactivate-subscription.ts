import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ReactivateSubscriptionPost = typeof client.api.team['reactivate-subscription']['$post'];
type ResponseType = InferResponseType<ReactivateSubscriptionPost, 200>;

export const useReactivateSubscription = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('organization');

    return useMutation<ResponseType, Error>({
        mutationFn: async () => {
            const response = await client.api.team['reactivate-subscription'].$post();

            if (!response.ok) {
                throw new Error('Failed to reactivate subscription');
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success(t('subscription-reactivated'));
            queryClient.invalidateQueries({ queryKey: ['team', 'context'] });
        },
        onError: () => {
            toast.error(t('subscription-reactivate-error'));
        },
    });
};
