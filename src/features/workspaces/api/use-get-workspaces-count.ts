import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { DEMO_WORKSPACES_DATA } from "@/lib/demo-data";

export const useGetWorkspacesCount = () => {
    const { isDemo, isLoadingUser } = useAppContext();

    const query = useQuery({
        queryKey: ['workspaces', 'count', isDemo],
        queryFn: async () => {
            if (isDemo) return { count: DEMO_WORKSPACES_DATA.documents.length };

            const response = await client.api.workspaces.count.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch workspaces count')
            }

            const { data } = await response.json();

            return data;
        },
        enabled: !isLoadingUser && !isDemo,
        initialData: isDemo ? { count: DEMO_WORKSPACES_DATA.documents.length } : undefined,
    })

    return query;
}
