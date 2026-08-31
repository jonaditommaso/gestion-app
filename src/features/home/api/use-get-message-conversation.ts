import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";
import type { Message } from "@/features/home/components/messages/types";

type ResponseType = InferResponseType<typeof client.api.messages[':messageId']['conversation']['$get'], 200>

type ConversationData = {
    conversationId: string | null;
    selectedMessageId: string;
    messages: Message[];
};

interface UseGetMessageConversationOptions {
    messageId: string | null;
    enabled?: boolean;
}

export const useGetMessageConversation = ({ messageId, enabled = true }: UseGetMessageConversationOptions) => {
    const { isDemo, isLoadingTeamContext } = useAppContext();
    const demoData = useDemoData();

    return useQuery<ConversationData>({
        queryKey: ['messages', 'conversation', messageId, isDemo],
        queryFn: async () => {
            if (!messageId) {
                return {
                    conversationId: null,
                    selectedMessageId: '',
                    messages: [],
                };
            }

            if (isDemo) {
                const selectedMessage = demoData.messages.find(message => message.$id === messageId) ?? null;

                if (!selectedMessage) {
                    return {
                        conversationId: null,
                        selectedMessageId: messageId,
                        messages: [],
                    };
                }

                if (!selectedMessage.conversationId) {
                    return {
                        conversationId: null,
                        selectedMessageId: messageId,
                        messages: [selectedMessage],
                    };
                }

                const messages = demoData.messages
                    .filter(message => message.conversationId === selectedMessage.conversationId)
                    .sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime());

                return {
                    conversationId: selectedMessage.conversationId,
                    selectedMessageId: messageId,
                    messages,
                };
            }

            const response = await client.api.messages[':messageId']['conversation']['$get']({
                param: { messageId },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch message conversation');
            }

            const json = await response.json() as ResponseType;

            return (json.data ?? {
                conversationId: null,
                selectedMessageId: messageId,
                messages: [],
            }) as ConversationData;
        },
        enabled: !isLoadingTeamContext && enabled && Boolean(messageId),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });
};
