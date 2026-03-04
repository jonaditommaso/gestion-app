import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetDealSellers = () => {
    return useQuery({
        queryKey: ["deal-sellers"],
        queryFn: async () => {
            const response = await client.api.sells.sellers.$get();

            if (!response.ok) {
                throw new Error("Failed to fetch sellers");
            }

            const { data } = await response.json();
            return data;
        },
        retry: false,
        refetchOnMount: true,
    });
};
