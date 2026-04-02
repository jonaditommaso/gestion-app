import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { DEMO_SELLERS_DATA } from "@/lib/demo-data";

export const useGetDealSellers = () => {
    const { isDemo, isLoadingUser } = useAppContext();

    return useQuery({
        queryKey: ["deal-sellers", isDemo],
        queryFn: async () => {
            if (isDemo) return DEMO_SELLERS_DATA;

            const response = await client.api.sells.sellers.$get();

            if (!response.ok) {
                throw new Error("Failed to fetch sellers");
            }

            const { data } = await response.json();
            return data;
        },
        enabled: !isLoadingUser,
        retry: false,
        refetchOnMount: true,
    });
};
