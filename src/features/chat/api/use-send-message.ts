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
    functionCalled?: string; // Nueva propiedad para saber si se llamó una función
}

interface UseSendMessageOptions {
    onChunk?: (chunk: string) => void;
    onComplete?: (fullResponse: string, conversationId: string, modelName: string) => void;
    onError?: (error: Error) => void;
    // Nuevo callback para cuando se ejecuta una función
    onFunctionCalled?: (functionName: string) => void;
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
            // NUEVO: Detectar si se llamó una función
            const functionCalled = response.headers.get('X-Function-Called') || undefined;

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

            return { response: fullResponse, conversationId: newConversationId, modelName, functionCalled };
        },
        onSuccess: ({ response, conversationId, modelName, functionCalled }) => {
            options?.onComplete?.(response, conversationId, modelName);
            // Invalidar la lista de conversaciones en segundo plano
            queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });

            // NUEVO: Si se llamó una función, notificar e invalidar queries relacionadas
            if (functionCalled) {
                options?.onFunctionCalled?.(functionCalled);

                // Invalidar queries según la función que se llamó
                if (functionCalled === 'create_note') {
                    // Invalidar la query de notas para que se actualice la lista
                    queryClient.invalidateQueries({ queryKey: ['notes'] });
                }
            }
        },
        onError: (error) => {
            options?.onError?.(error);
        }
    });

    return mutation;
};
