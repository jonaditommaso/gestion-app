import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetArchived = () => {
    const query = useQuery({
        queryKey: ['billing-archived'],
        queryFn: async () => {
            const response = await client.api.billing.archived.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch archived');
            }

            const { data } = await response.json();

            return data;
        },
        retry: false,
    });

    return query;
};
