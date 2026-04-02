import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";

export const useGetSentMessages = () => {
    const { isDemo, isLoadingUser } = useAppContext();

    const query = useQuery({
        queryKey: ['messages', 'sent', isDemo],
        queryFn: async () => {
            if (isDemo) {
                return { documents: [], total: 0 };
            }

            const response = await client.api.messages.sent.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch sent messages')
            }

            const { data } = await response.json();

            return data;
        },
        enabled: !isLoadingUser,
        refetchOnMount: false
    })

    return query;
}
