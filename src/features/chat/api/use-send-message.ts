import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { ChatMessage } from "@/ai/types";

interface SendMessageParams {
    messages: ChatMessage[];
    conversationId?: string;
}

interface SendMessageResult {
    response: string;
    conversationId: string;
    modelName: string;
}

interface UseSendMessageOptions {
    onChunk?: (chunk: string) => void;
    onComplete?: (fullResponse: string, conversationId: string, modelName: string) => void;
    onError?: (error: Error) => void;
}

export const useSendMessage = (options?: UseSendMessageOptions) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<SendMessageResult, Error, SendMessageParams>({
        mutationFn: async ({ messages, conversationId }) => {
            const response = await client.api.chat.$post({
                json: { messages, conversationId }
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            // Obtener el conversationId y modelName de los headers
            const newConversationId = response.headers.get('X-Conversation-Id') || conversationId || '';
            const modelName = response.headers.get('X-Model-Name') || 'AI';

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No reader available');
            }

            const decoder = new TextDecoder();
            let fullResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullResponse += chunk;
                options?.onChunk?.(chunk);
            }

            return { response: fullResponse, conversationId: newConversationId, modelName };
        },
        onSuccess: ({ response, conversationId, modelName }) => {
            options?.onComplete?.(response, conversationId, modelName);
            // Invalidar la lista de conversaciones en segundo plano
            queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
        },
        onError: (error) => {
            options?.onError?.(error);
        }
    });

    return mutation;
};
