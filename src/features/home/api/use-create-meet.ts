import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api['meet-validation-permission']['$post'], 200>
type RequestType = InferRequestType<typeof client.api['meet-validation-permission']['$post']>

export const useCreateMeet = () => {
    const t = useTranslations('home');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api['meet-validation-permission']['$post']({ json });

            return await response.json()
        },
        onSuccess: ({ data }) => {
            // setTimeout allows React to re-render (pendingMutations → 0)
            // before the navigation triggers beforeunload, avoiding the
            // "unsaved changes" browser alert from usePendingChangesWarning.
            setTimeout(() => {
                window.location.href = data;
            }, 0);
        },
        onError: () => {
            toast.error(t('failed-create-meet'))// there is no json key
        }
    })
    return mutation;
}