import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { DEMO_BILLING_OPTIONS } from "@/lib/demo-data";

export const useGetBillingOptions = () => {
    const { isDemo, isLoadingUser } = useAppContext();

    const query = useQuery({
        queryKey: ['billing-options', isDemo],
        queryFn: async () => {
            if (isDemo) return DEMO_BILLING_OPTIONS;

            const response = await client.api.billing['options'].$get();

            if (!response.ok) {
                throw new Error('Failed to fetch options')
            }

            const { data } = await response.json();

            return data;
        },
        enabled: !isLoadingUser,
    })

    return query;
}