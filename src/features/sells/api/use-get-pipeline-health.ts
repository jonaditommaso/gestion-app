import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";

export type PipelineHealthCurrencyStats = {
    currency: string;
    totalValue: number;
    weightedValue: number;
};

export type PipelineHealthWonStats = {
    currency: string;
    totalValue: number;
};

export type PipelineHealthData = {
    leadsCount: number;
    openDealsCount: number;
    negotiationCount: number;
    wonThisWeek: number;
    totalByCurrency: PipelineHealthCurrencyStats[];
    wonThisWeekByCurrency: PipelineHealthWonStats[];
};

export const useGetPipelineHealth = () => {
    const { isDemo, isLoadingUser } = useAppContext();

    return useQuery({
        queryKey: ["pipeline-health", isDemo],
        queryFn: async () => {
            if (isDemo) {
                return {
                    leadsCount: 1,
                    openDealsCount: 4,
                    negotiationCount: 2,
                    wonThisWeek: 0,
                    totalByCurrency: [{ currency: 'USD', totalValue: 101000, weightedValue: 75700 }],
                    wonThisWeekByCurrency: [],
                } as PipelineHealthData;
            }

            const response = await client.api.sells["pipeline-health"].$get();

            if (!response.ok) {
                throw new Error("Failed to fetch pipeline health");
            }

            const { data } = await response.json();
            return data as PipelineHealthData;
        },
        enabled: !isLoadingUser,
        retry: false,
        refetchOnMount: true,
    });
};
