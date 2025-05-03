import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetMeets = () => {
    const query = useQuery({
        queryKey: ['meets'],
        queryFn: async () => {
            const response = await client.api.meets.$get();

            if(!response.ok) {
                throw new Error('Failed to fetch meets')
            }

            const { data } = await response.json();

            return data;
        },
        refetchOnMount: false
    })

    return query;
}