import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetSentMessages = () => {
    const query = useQuery({
        queryKey: ['messages', 'sent'],
        queryFn: async () => {
            const response = await client.api.messages.sent.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch sent messages')
            }

            const { data } = await response.json();

            return data;
        },
        refetchOnMount: false
    })

    return query;
}
