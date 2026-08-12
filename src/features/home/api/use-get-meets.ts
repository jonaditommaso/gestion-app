import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";

export const useGetMeets = (options?: { enabled?: boolean }) => {
    const { isDemo, isLoadingTeamContext } = useAppContext();

    const query = useQuery({
        queryKey: ['meets', isDemo],
        queryFn: async () => {
            if (isDemo) return [];

            const response = await client.api.meets.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch meets')
            }

            const { data } = await response.json();

            return data;
        },
        refetchOnMount: false,
        enabled: !isLoadingTeamContext && (options?.enabled ?? true),
    })

    return query;
}