import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { DEMO_RECENT_ACTIVITY } from "@/lib/demo-data";

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
    const { isDemo, isLoadingUser } = useAppContext();

    return useQuery({
        queryKey: ["home", "recent-activity", isDemo],
        queryFn: async () => {
            if (isDemo) return DEMO_RECENT_ACTIVITY;

            const response = await client.api["recent-activity"].$get();

            if (!response.ok) {
                throw new Error("Failed to fetch recent activity");
            }

            const { data } = await response.json();
            return data as RecentActivityItem[];
        },
        retry: false,
        refetchOnMount: true,
        enabled: !isLoadingUser,
    });
};
