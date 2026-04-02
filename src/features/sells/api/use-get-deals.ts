import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";

export const useGetDeals = () => {
    const { isDemo, isLoadingUser } = useAppContext();
    const demoData = useDemoData();

    return useQuery({
        queryKey: ["deals", isDemo],
        queryFn: async () => {
            if (isDemo) return { total: demoData.deals.length, documents: demoData.deals };

            const response = await client.api.sells.$get();

            if (!response.ok) {
                throw new Error("Failed to fetch deals");
            }

            const { data } = await response.json();
            return data;
        },
        enabled: !isLoadingUser,
        retry: false,
        refetchOnMount: true,
    });
};
