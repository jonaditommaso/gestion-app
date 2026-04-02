import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { DEMO_TABLES_DATA } from "@/lib/demo-data";

export const useGetTables = () => {
    const { isDemo } = useAppContext();

    const query = useQuery({
        queryKey: ['tables'],
        queryFn: async () => {
            if (isDemo) return DEMO_TABLES_DATA;

            const response = await client.api.records.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch tables')
            }

            const { data } = await response.json();

            return data;
        },
        refetchOnMount: true
    })

    return query;
}