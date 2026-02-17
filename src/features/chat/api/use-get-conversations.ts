import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetConversations = (options?: { enabled?: boolean }) => {
    const query = useQuery({
        queryKey: ['chat-conversations'],
        queryFn: async () => {
            const response = await client.api.chat.conversations.$get();

            if (!response.ok) {
                throw new Error('Failed to get conversations');
            }

            const { data } = await response.json();
            return data;
        },
        enabled: options?.enabled ?? true,
    });

    return query;
};
