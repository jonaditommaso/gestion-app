import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetConversationOptions {
    conversationId: string | null;
}

export const useGetConversation = ({ conversationId }: UseGetConversationOptions) => {
    const query = useQuery({
        queryKey: ['chat-conversation', conversationId],
        queryFn: async () => {
            if (!conversationId) return null;

            const response = await client.api.chat.conversations[':conversationId'].$get({
                param: { conversationId }
            });

            if (!response.ok) {
                throw new Error('Failed to get conversation');
            }

            const { data } = await response.json();
            return data;
        },
        enabled: !!conversationId,
    });

    return query;
};
