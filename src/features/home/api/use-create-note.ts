import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.notes['$post'], 200>
type RequestType = InferRequestType<typeof client.api.notes['$post']>

export const useCreateNote = () => {
    const router = useRouter()
    const queryClient = useQueryClient();
    const t = useTranslations('home');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json }) => {
            const response = await client.api.notes['$post']({ json });

            if(!response.ok) {
                throw new Error('Failed to create note')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('note-created'))
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['notes'] })
        },
        onError: () => {
            toast.error(t('failed-create-note'))
        }
    })
    return mutation
}