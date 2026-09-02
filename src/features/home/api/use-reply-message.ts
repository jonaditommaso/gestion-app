import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";
import type { Message } from "@/features/home/components/messages/types";
import { DEMO_TEAM_MEM_YOU_ID } from "@/lib/demo-data";

type ResponseType = InferResponseType<typeof client.api.messages[':messageId']['reply']['$post'], 200>
type RequestType = InferRequestType<typeof client.api.messages[':messageId']['reply']['$post']>

export const useReplyMessage = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('home');
    const { isDemo } = useAppContext();
    const demoData = useDemoData();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param, json }) => {
            if (isDemo) {
                const originalMessage = demoData.messages.find(message => message.$id === param.messageId);

                if (!originalMessage) {
                    throw new Error('Original message not found');
                }

                const currentMemberId = DEMO_TEAM_MEM_YOU_ID;
                const isRecipient = originalMessage.toTeamMemberId === currentMemberId;
                const isSender = originalMessage.fromTeamMemberId === currentMemberId;

                if (!isRecipient && !isSender) {
                    throw new Error('Forbidden');
                }

                let rootMessage = originalMessage;
                if (originalMessage.conversationId) {
                    const conversationMessages = demoData.messages
                        .filter(message => message.conversationId === originalMessage.conversationId)
                        .sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime());

                    if (conversationMessages.length > 0) {
                        rootMessage = conversationMessages[0];
                    }
                }

                const rootSubject = (rootMessage.subject ?? originalMessage.subject ?? '').trim() || 'No subject';

                let conversationId = originalMessage.conversationId;
                if (!conversationId) {
                    conversationId = `demo-conv-${Date.now()}-${originalMessage.$id}`;

                    demoData.updateMessage(rootMessage.$id, { conversationId });
                    if (rootMessage.$id !== originalMessage.$id) {
                        demoData.updateMessage(originalMessage.$id, { conversationId });
                    }
                }

                const toTeamMemberId = isRecipient ? originalMessage.fromTeamMemberId : originalMessage.toTeamMemberId;
                const nowIso = new Date().toISOString();
                const replyMessage: Message = {
                    $id: `demo-msg-reply-${Date.now()}-${originalMessage.$id}`,
                    $createdAt: nowIso,
                    $updatedAt: nowIso,
                    $collectionId: 'demo',
                    $databaseId: 'demo',
                    $permissions: [],
                    subject: rootSubject,
                    content: json.content,
                    toTeamMemberId,
                    fromTeamMemberId: currentMemberId,
                    teamId: originalMessage.teamId,
                    conversationId,
                    replyToMessageId: originalMessage.$id,
                    read: false,
                };

                demoData.addMessage(replyMessage);

                return {
                    data: {
                        conversationId,
                        rootMessageId: rootMessage.$id,
                        message: replyMessage,
                    }
                } as unknown as ResponseType;
            }

            const response = await client.api.messages[':messageId']['reply']['$post']({ param, json });

            if (!response.ok) {
                throw new Error('Failed to reply message');
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success(t('messages-created'));
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            queryClient.invalidateQueries({ queryKey: ['messages', 'conversation'] });
        },
        onError: () => {
            toast.error(t('failed-create-message'));
        }
    });

    return mutation;
};
