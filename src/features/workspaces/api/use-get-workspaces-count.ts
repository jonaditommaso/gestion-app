import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetWorkspacesCount = () => {
    const query = useQuery({
        queryKey: ['workspaces', 'count'],
        queryFn: async () => {
            const response = await client.api.workspaces.count.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch workspaces count')
            }

            const { data } = await response.json();

            return data;
        }
    })

    return query;
}
