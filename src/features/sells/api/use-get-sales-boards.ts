import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetSalesBoards = () => {
    return useQuery({
        queryKey: ["sales-boards"],
        queryFn: async () => {
            const response = await client.api.sells.boards.$get();

            if (!response.ok) {
                throw new Error("Failed to fetch sales boards");
            }

            const { data } = await response.json();
            return data;
        },
        retry: false,
        refetchOnMount: true,
    });
};
