import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.notes[':noteId']['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.notes[':noteId']['$patch']>

export const useUpdateNote = () => {
    const router = useRouter()
    const queryClient = useQueryClient();
    const t = useTranslations('home');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param, json }) => {
            const response = await client.api.notes[':noteId']['$patch']({ param, json });

            if (!response.ok) {
                throw new Error('Failed to update note')
            }

            return await response.json()
        },
        onSuccess: () => {
            //toast.success(t('note-updated'))
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['notes'] })
        },
        onError: () => {
            toast.error(t('failed-update-note'))
        }
    })
    return mutation
}
