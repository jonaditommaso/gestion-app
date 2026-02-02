import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetConversations = () => {
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
    });

    return query;
};
