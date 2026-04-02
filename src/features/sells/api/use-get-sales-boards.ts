import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { DEMO_SALES_BOARD_DATA } from "@/lib/demo-data";

export const useGetSalesBoards = () => {
    const { isDemo, isLoadingUser } = useAppContext();

    return useQuery({
        queryKey: ["sales-boards", isDemo],
        queryFn: async () => {
            if (isDemo) return DEMO_SALES_BOARD_DATA;

            const response = await client.api.sells.boards.$get();

            if (!response.ok) {
                throw new Error("Failed to fetch sales boards");
            }

            const { data } = await response.json();
            return data;
        },
        enabled: !isLoadingUser,
        retry: false,
        refetchOnMount: true,
    });
};
