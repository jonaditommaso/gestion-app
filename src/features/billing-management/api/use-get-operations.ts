import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";

export const useGetOperations = (options?: { enabled?: boolean }) => {
    const { isDemo } = useAppContext();
    const demoData = useDemoData();

    const query = useQuery({
        queryKey: ['billing'],
        queryFn: async () => {
            if (isDemo) return { total: demoData.billingOps.length, documents: demoData.billingOps };

            const response = await client.api.billing.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch operations')
            }

            const { data } = await response.json();

            return data;
        },
        retry: false,
        enabled: isDemo || (options?.enabled ?? true),
    })

    return query;
}