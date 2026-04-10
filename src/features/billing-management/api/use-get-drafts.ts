import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";

export const useGetDrafts = () => {
    const { isDemo, isLoadingUser } = useAppContext();
    const demoData = useDemoData();

    const query = useQuery({
        queryKey: ['billing-drafts', isDemo],
        queryFn: async () => {
            if (isDemo) return { total: demoData.billingDrafts.length, documents: demoData.billingDrafts };

            const response = await client.api.billing.drafts.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch drafts');
            }

            const { data } = await response.json();

            return data;
        },
        retry: false,
        enabled: !isLoadingUser,
    });

    return query;
};
