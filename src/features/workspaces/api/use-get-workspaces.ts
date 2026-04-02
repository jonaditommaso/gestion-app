import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { DEMO_WORKSPACES_DATA } from "@/lib/demo-data";

export const useGetWorkspaces = () => {
    const { isDemo, isLoadingUser } = useAppContext();

    const query = useQuery({
        queryKey: ['workspaces', isDemo],
        queryFn: async () => {
            if (isDemo) return DEMO_WORKSPACES_DATA;

            const response = await client.api.workspaces.$get();

            if(!response.ok) {
                throw new Error('Failed to fetch workspaces')
            }

            const { data } = await response.json();

            return data;
        },
        enabled: !isLoadingUser,
    })

    return query;
}