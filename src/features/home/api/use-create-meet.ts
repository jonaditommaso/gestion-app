import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = { data: string }
type RequestType = InferRequestType<typeof client.api['meet-validation-permission']['$post']>

export const useCreateMeet = () => {
    const t = useTranslations('home');
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }): Promise<ResponseType> => {
            const response = await client.api['meet-validation-permission']['$post']({ json });
            if (!response.ok) throw new Error('Failed to create meet');
            return await response.json() as unknown as ResponseType;
        },
        onSuccess: ({ data }) => {
            if (data.startsWith('https://accounts.google.com')) {
                // Fallback: needs OAuth consent (should be handled by modal, but just in case)
                window.location.href = data;
                return;
            }
            queryClient.invalidateQueries({ queryKey: ['meets'] });
            toast.success(t('meeting-created-successfully'));
        },
        onError: () => {
            toast.error(t('failed-create-meet'))// there is no json key
        }
    })
    return mutation;
}