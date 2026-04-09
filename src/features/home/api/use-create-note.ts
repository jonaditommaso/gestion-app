import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";
import type { NoteData } from "@/features/home/types";

type ResponseType = InferResponseType<typeof client.api.notes['$post'], 200>
type RequestType = InferRequestType<typeof client.api.notes['$post']>

export const useCreateNote = () => {
    const router = useRouter()
    const queryClient = useQueryClient();
    const t = useTranslations('home');
    const { isDemo } = useAppContext();
    const { addNote } = useDemoData();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            if (isDemo) {
                const note: NoteData = {
                    $id: `demo-note-${Date.now()}`,
                    $createdAt: new Date().toISOString(),
                    $updatedAt: new Date().toISOString(),
                    $collectionId: 'demo',
                    $databaseId: 'demo',
                    $permissions: [],
                    userId: 'demo-user-placeholder',
                    title: json.title as string | undefined,
                    content: json.content as string,
                    bgColor: json.bgColor as string ?? 'none',
                    isModern: json.isModern as boolean | undefined,
                    hasLines: json.hasLines as boolean | undefined,
                    isPinned: json.isPinned as boolean | undefined,
                    pinnedAt: json.pinnedAt as string | null | undefined,
                };
                addNote(note);
                queryClient.invalidateQueries({ queryKey: ['notes'] });
                return { success: true } as unknown as ResponseType;
            }

            const response = await client.api.notes['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to create note')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('note-created'))
            if (!isDemo) router.refresh();
            queryClient.invalidateQueries({ queryKey: ['notes'] })
        },
        onError: () => {
            toast.error(t('failed-create-note'))
        }
    })
    return mutation
}