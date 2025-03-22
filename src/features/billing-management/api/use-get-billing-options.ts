import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetBillingOptions = () => {
    const query = useQuery({
        queryKey: ['billing-options'],
        queryFn: async () => {
            const response = await client.api.billing['options'].$get();

            if(!response.ok) {
                throw new Error('Failed to fetch options')
            }

            const { data } = await response.json();

            return data;
        }
    })

    return query;
}