import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetRolesPermissions = () => {
    const query = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const response = await client.api.roles.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch roles permissions')
            }

            const { data } = await response.json();

            return data;
        },
        refetchOnMount: true
    })

    return query;
}