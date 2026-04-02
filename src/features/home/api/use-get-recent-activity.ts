import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export type RecentActivityType = 'task_activity' | 'deal_created' | 'deal_won' | 'deal_activity';

export type RecentActivityItem = {
    id: string;
    type: RecentActivityType;
    actorName: string | null;
    action: string;
    title: string;
    amount?: number;
    currency?: string;
    timestamp: string;
};

export const useGetRecentActivity = () => {
    return useQuery({
        queryKey: ["home", "recent-activity"],
        queryFn: async () => {
            const response = await client.api["recent-activity"].$get();

            if (!response.ok) {
                throw new Error("Failed to fetch recent activity");
            }

            const { data } = await response.json();
            return data as RecentActivityItem[];
        },
        retry: false,
        refetchOnMount: true,
    });
};
