import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type LeaveOrganizationPost = typeof client.api.team['leave-organization']['$post'];
type ResponseType = InferResponseType<LeaveOrganizationPost, 200>;

export const useLeaveOrganization = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const t = useTranslations('settings');

    return useMutation<ResponseType, Error>({
        mutationFn: async () => {
            const response = await client.api.team['leave-organization']['$post']();

            if (!response.ok) {
                throw new Error('Failed to leave organization');
            }

            return response.json();
        },
        onSuccess: () => {
            toast.success(t('leave-organization-success'));
            queryClient.invalidateQueries({ queryKey: ['team'] });
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['current'] });
            router.refresh();
        },
        onError: () => {
            toast.error(t('leave-organization-error'));
        },
    });
};
