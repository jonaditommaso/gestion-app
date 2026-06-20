import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";
import type { Message } from "@/features/home/components/messages/types";

type ResponseType = InferResponseType<typeof client.api.messages[':messageId']['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.messages[':messageId']['$patch']>

type MessagesQueryData = {
    documents: Message[];
    total: number;
};

export const useUpdateMessage = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('home');
    const { isDemo } = useAppContext();
    const { updateMessage: updateDemoMessage, deleteMessage: deleteDemoMessage } = useDemoData();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param, json }) => {
            if (isDemo) {
                const patch = json as Partial<Message>;
                const isDeleting = patch.deletedByRecipient === true || patch.deletedBySender === true;

                if (isDeleting) {
                    deleteDemoMessage(param.messageId);
                } else {
                    updateDemoMessage(param.messageId, patch);
                }

                const updateCache = (previous?: MessagesQueryData) => {
                    const documents = (previous?.documents ?? []) as Message[];

                    if (isDeleting) {
                        const nextDocuments = documents.filter(message => message.$id !== param.messageId);
                        return { documents: nextDocuments, total: nextDocuments.length } satisfies MessagesQueryData;
                    }

                    const nextDocuments = documents.map(message =>
                        message.$id === param.messageId ? { ...message, ...patch } : message
                    );

                    return { documents: nextDocuments, total: nextDocuments.length } satisfies MessagesQueryData;
                };

                queryClient.setQueryData<MessagesQueryData>(['messages', true], updateCache);
                queryClient.setQueryData<MessagesQueryData>(['messages', 'sent', true], updateCache);

                return { success: true } as unknown as ResponseType;
            }

            const response = await client.api.messages[':messageId']['$patch']({ param, json });

            if (!response.ok) {
                throw new Error('Failed to update message')
            }

            return await response.json();
        },
        onSuccess: () => {
            if (!isDemo) {
                queryClient.invalidateQueries({ queryKey: ['messages'] });
            }
        },
        onError: () => {
            toast.error(t('failed-update-messages'));
        }
    });

    return mutation;
}
