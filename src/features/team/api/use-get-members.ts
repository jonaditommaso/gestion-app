import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetMembers = () => {
    const query = useQuery({
        queryKey: ['team', 'member-tag'],
        queryFn: async () => {
            const response = await client.api.team.$get();

            if(!response.ok) {
                throw new Error('Failed to fetch members')
            }

            const { data } = await response.json();

            return data;
        }
    })

    return query;
}