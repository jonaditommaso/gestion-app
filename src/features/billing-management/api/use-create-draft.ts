import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.billing['$post']>
type RequestType = InferRequestType<typeof client.api.billing['$post']>

export const useCreateDraft = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('billing');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.billing['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to save draft');
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success(t('draft-saved'));
            queryClient.invalidateQueries({ queryKey: ['billing-drafts'] });
        },
        onError: () => {
            toast.error(t('failed-save-draft'));
        },
    });

    return mutation;
};
