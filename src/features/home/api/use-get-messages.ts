import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetMessages = (options?: { enabled?: boolean }) => {
    const query = useQuery({
        queryKey: ['messages'],
        queryFn: async () => {
            const response = await client.api.messages.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch messages')
            }

            const { data } = await response.json();

            return data;
        },
        refetchOnMount: false,
        enabled: options?.enabled ?? true,
    })

    return query;
}