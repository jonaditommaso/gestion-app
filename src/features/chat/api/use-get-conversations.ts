import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";

export const useGetConversations = (options?: { enabled?: boolean }) => {
    const { isDemo, isLoadingTeamContext } = useAppContext();

    const query = useQuery({
        queryKey: ['chat-conversations', isDemo],
        queryFn: async () => {
            if (isDemo) return [] as never[];

            const response = await client.api.chat.conversations.$get();

            if (!response.ok) {
                throw new Error('Failed to get conversations');
            }

            const { data } = await response.json();
            return data;
        },
        enabled: !isLoadingTeamContext && (options?.enabled ?? true),
    });

    return query;
};
