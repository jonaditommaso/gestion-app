import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";

type ResponseType = InferResponseType<typeof client.api.notes[':noteId']['$delete'], 200>
type RequestType = InferRequestType<typeof client.api.notes[':noteId']['$delete']>

export const useDeleteNote = () => {
    const router = useRouter()
    const queryClient = useQueryClient();
    const t = useTranslations('home');
    const { isDemo } = useAppContext();
    const { deleteNote } = useDemoData();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            if (isDemo) {
                deleteNote(param.noteId);
                queryClient.invalidateQueries({ queryKey: ['notes'] });
                return { success: true } as unknown as ResponseType;
            }

            const response = await client.api.notes[':noteId']['$delete']({ param });

            if (!response.ok) {
                throw new Error('Failed to delete note')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('note-deleted'))
            if (!isDemo) {
                router.refresh();
                queryClient.invalidateQueries({ queryKey: ['notes'] })
            }
        },
        onError: () => {
            toast.error(t('failed-delete-note'))
        }
    })
    return mutation
}
