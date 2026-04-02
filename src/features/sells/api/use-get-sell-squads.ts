import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";

export const useGetSellSquads = () => {
    const { isDemo, isLoadingUser } = useAppContext();

    return useQuery({
        queryKey: ["sell-squads", isDemo],
        queryFn: async () => {
            if (isDemo) return { total: 0, documents: [] };

            const response = await client.api.sells.squads.$get();

            if (!response.ok) {
                throw new Error("Failed to fetch sell squads");
            }

            const { data } = await response.json();
            return data;
        },
        enabled: !isLoadingUser,
        retry: false,
        refetchOnMount: true,
    });
};
