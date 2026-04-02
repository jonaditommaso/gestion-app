import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";

export const useGetNotifications = () => {
    const { isDemo, isLoadingUser } = useAppContext();

    const query = useQuery({
        queryKey: ['notifications', isDemo],
        queryFn: async () => {
            if (isDemo) return { total: 0, documents: [] };

            const response = await client.api.notifications.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch notifications')
            }

            const { data } = await response.json();

            return data;
        },
        enabled: !isLoadingUser,
    })

    return query;
}