import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";

export const useGetArchived = () => {
    const { isDemo } = useAppContext();
    const demoData = useDemoData();

    const query = useQuery({
        queryKey: ['billing-archived'],
        queryFn: async () => {
            if (isDemo) return { total: demoData.billingArchived.length, documents: demoData.billingArchived };

            const response = await client.api.billing.archived.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch archived');
            }

            const { data } = await response.json();

            return data;
        },
        retry: false,
    });

    return query;
};
