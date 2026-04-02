import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.messages[':messageId']['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.messages[':messageId']['$patch']>

export const useUpdateMessage = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('home');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param, json }) => {
            const response = await client.api.messages[':messageId']['$patch']({ param, json });

            if (!response.ok) {
                throw new Error('Failed to update message')
            }

            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
        onError: () => {
            toast.error(t('failed-update-messages'));
        }
    });

    return mutation;
}
