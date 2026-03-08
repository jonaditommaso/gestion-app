import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetDrafts = () => {
    const query = useQuery({
        queryKey: ['billing-drafts'],
        queryFn: async () => {
            const response = await client.api.billing.drafts.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch drafts');
            }

            const { data } = await response.json();

            return data;
        },
        retry: false,
    });

    return query;
};
