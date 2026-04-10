import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";

export const useGetRolesPermissions = (options?: { enabled?: boolean }) => {
    const { isDemo, isLoadingUser } = useAppContext();

    const query = useQuery({
        queryKey: ['roles', isDemo],
        queryFn: async () => {
            if (isDemo) return { documents: [], total: 0 };

            const response = await client.api.roles.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch roles permissions')
            }

            const { data } = await response.json();

            return data;
        },
        enabled: !isLoadingUser && (options?.enabled ?? true),
        refetchOnMount: true
    })

    return query;
}