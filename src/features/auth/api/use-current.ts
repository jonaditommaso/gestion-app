import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useCurrent = ({ enabled = true }: { enabled?: boolean } = {}) => {
    const query = useQuery({
        queryKey: ['current'],
        enabled,
        queryFn: async () => {
            // usa fetch, no axios, axios lanzaria un error, no queremos eso por ahora, por eso retornamos null
            const response = await client.api.auth.current.$get();

            if (!response.ok) {
                return null;
            }

            const { data } = await response.json();

            return data;
        }
    })

    return query;
}