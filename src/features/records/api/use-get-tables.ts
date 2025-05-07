import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetTables = () => {
    const query = useQuery({
        queryKey: ['tables'],
        queryFn: async () => {
            const response = await client.api.records.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch tables')
            }

            const { data } = await response.json();

            return data;
        },
        refetchOnMount: true
    })

    return query;
}