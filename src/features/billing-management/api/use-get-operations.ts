import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetOperations = () => {
    const query = useQuery({
        queryKey: ['billing',],
        queryFn: async () => {
            const response = await client.api.billing.$get();

            if(!response.ok) {
                throw new Error('Failed to fetch operations')
            }

            const { data } = await response.json();

            return data;
        },
        retry: false
    })

    return query;
}