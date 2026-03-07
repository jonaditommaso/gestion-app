import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

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
    return useQuery({
        queryKey: ["pipeline-health"],
        queryFn: async () => {
            const response = await client.api.sells["pipeline-health"].$get();

            if (!response.ok) {
                throw new Error("Failed to fetch pipeline health");
            }

            const { data } = await response.json();
            return data as PipelineHealthData;
        },
        retry: false,
        refetchOnMount: true,
    });
};
