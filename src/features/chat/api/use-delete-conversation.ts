import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseDeleteConversationOptions {
    onSuccess?: (conversationId: string) => void;
}

export const useDeleteConversation = (options?: UseDeleteConversationOptions) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (conversationId: string) => {
            const response = await client.api.chat.conversations[':conversationId'].$delete({
                param: { conversationId }
            });

            if (!response.ok) {
                throw new Error('Failed to delete conversation');
            }

            return { conversationId };
        },
        onSuccess: ({ conversationId }) => {
            queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
            options?.onSuccess?.(conversationId);
        },
    });

    return mutation;
};
