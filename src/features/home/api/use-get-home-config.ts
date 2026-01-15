import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetHomeConfig = () => {
    const query = useQuery({
        queryKey: ['home-config'],
        queryFn: async () => {
            const response = await client.api['home-config'].$get();

            if (!response.ok) {
                throw new Error('Failed to fetch home config')
            }

            const { data } = await response.json();

            return data;
        },
        refetchOnMount: false
    })

    return query;
}
