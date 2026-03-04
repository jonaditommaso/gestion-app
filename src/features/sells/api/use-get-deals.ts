import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetDeals = () => {
    return useQuery({
        queryKey: ["deals"],
        queryFn: async () => {
            const response = await client.api.sells.$get();

            if (!response.ok) {
                throw new Error("Failed to fetch deals");
            }

            const { data } = await response.json();
            return data;
        },
        retry: false,
        refetchOnMount: true,
    });
};
