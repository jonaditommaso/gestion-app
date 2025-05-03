import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetMember = () => {
    const query = useQuery({
        queryKey: ['member'],
        queryFn: async () => {
            const response = await client.api.members['current'].$get();

            if(!response.ok) {
                throw new Error('Failed to fetch current member')
            }

            const { data } = await response.json();

            return data;
        },
        retry: false,
        refetchOnMount: false
    })

    return query;
}