import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetRecords = () => {
    const query = useQuery({
        queryKey: ['records'],
        queryFn: async () => {
            const response = await client.api.records.$get();

            if(!response.ok) {
                throw new Error('Failed to fetch records')
            }

            const { data } = await response.json();

            return data;
        }
    })

    return query;
}