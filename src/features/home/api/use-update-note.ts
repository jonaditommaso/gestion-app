import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";

type ResponseType = InferResponseType<typeof client.api.notes[':noteId']['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.notes[':noteId']['$patch']>

export const useUpdateNote = () => {
    const router = useRouter()
    const queryClient = useQueryClient();
    const t = useTranslations('home');
    const { isDemo } = useAppContext();
    const { updateNote } = useDemoData();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param, json }) => {
            if (isDemo) {
                updateNote(param.noteId, json as Parameters<typeof updateNote>[1]);
                queryClient.invalidateQueries({ queryKey: ['notes'] });
                return { success: true } as unknown as ResponseType;
            }

            const response = await client.api.notes[':noteId']['$patch']({ param, json });

            if (!response.ok) {
                throw new Error('Failed to update note')
            }

            return await response.json()
        },
        onSuccess: () => {
            if (!isDemo) {
                router.refresh();
                queryClient.invalidateQueries({ queryKey: ['notes'] })
            }
        },
        onError: () => {
            toast.error(t('failed-update-note'))
        }
    })
    return mutation
}
