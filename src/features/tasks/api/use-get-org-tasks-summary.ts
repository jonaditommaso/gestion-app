import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";

export const useGetOrgTasksSummary = (options?: { enabled?: boolean }) => {
    const { isDemo, isLoadingUser } = useAppContext();

    const query = useQuery({
        queryKey: ['tasks', 'org-summary', isDemo],
        queryFn: async () => {
            if (isDemo) {
                return {
                    overdueCount: 3,
                    unassignedFeaturedCount: 2,
                    overdueByWorkspace: [],
                    unassignedFeaturedByWorkspace: [],
                };
            }

            const response = await client.api.tasks['org-summary'].$get();

            if (!response.ok) {
                throw new Error('Failed to fetch org tasks summary');
            }

            const { data } = await response.json();

            return data;
        },
        retry: false,
        enabled: !isLoadingUser && (options?.enabled ?? true),
    });

    return query;
};
