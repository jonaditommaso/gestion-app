import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { ChatMessage } from "@/ai/types";

interface UseSendMessageOptions {
    onChunk?: (chunk: string) => void;
    onComplete?: (fullResponse: string) => void;
    onError?: (error: Error) => void;
}

export const useSendMessage = (options?: UseSendMessageOptions) => {
    const mutation = useMutation<string, Error, ChatMessage[]>({
        mutationFn: async (messages) => {
            const response = await client.api.chat.$post({
                json: { messages }
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

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

            return fullResponse;
        },
        onSuccess: (data) => {
            options?.onComplete?.(data);
        },
        onError: (error) => {
            options?.onError?.(error);
        }
    });

    return mutation;
};
