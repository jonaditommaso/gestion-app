import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetSellSquads = () => {
    return useQuery({
        queryKey: ["sell-squads"],
        queryFn: async () => {
            const response = await client.api.sells.squads.$get();

            if (!response.ok) {
                throw new Error("Failed to fetch sell squads");
            }

            const { data } = await response.json();
            return data;
        },
        retry: false,
        refetchOnMount: true,
    });
};
