import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ChangePlanArgs = {
    plan: 'plus' | 'pro';
    billing: 'monthly' | 'annual';
};

export const useChangePlan = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const t = useTranslations('organization');

    return useMutation<{ success: true } | { url: string }, Error, ChangePlanArgs>({
        mutationFn: async ({ plan, billing }) => {
            const response = await client.api.team['change-plan'].$put({ json: { plan, billing } });
            if (!response.ok) throw new Error('Failed to change plan');
            return await response.json() as { success: true } | { url: string };
        },
        onSuccess: (data) => {
            if ('url' in data && data.url) {
                window.location.href = data.url;
                return;
            }
            toast.success(t('plan-changed-success'));
            queryClient.invalidateQueries({ queryKey: ['team', 'context'] });
            onSuccess?.();
        },
        onError: () => {
            toast.error(t('plan-change-error'));
        },
    });
};
