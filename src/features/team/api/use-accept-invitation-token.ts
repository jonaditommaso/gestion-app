import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type AcceptInvitationTokenPost = typeof client.api.team['accept-invitation-token']['$post'];
type ResponseType = InferResponseType<AcceptInvitationTokenPost, 200>;
type RequestType = InferRequestType<AcceptInvitationTokenPost>;

export const useAcceptInvitationToken = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('onboarding');

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.team['accept-invitation-token']['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to accept invitation token');
            }

            return response.json();
        },
        onSuccess: () => {
            toast.success(t('join-success'));
            queryClient.invalidateQueries({ queryKey: ['team'] });
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
        onError: () => {
            toast.error(t('join-error'));
        },
    });
};
