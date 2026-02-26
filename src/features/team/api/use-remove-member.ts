import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type RemoveMemberPost = typeof client.api.team['remove-member']['$post'];
type ResponseType = InferResponseType<RemoveMemberPost, 200>;
type RequestType = InferRequestType<RemoveMemberPost>;

export const useRemoveMember = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('team');

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.team['remove-member']['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to remove member');
            }

            return response.json();
        },
        onSuccess: () => {
            toast.success(t('member-removed-success'));
            queryClient.invalidateQueries({ queryKey: ['team'] });
        },
        onError: () => {
            toast.error(t('member-removed-error'));
        },
    });
};
