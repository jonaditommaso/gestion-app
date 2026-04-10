import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";

export const useGetHomeConfig = () => {
    const { isDemo, isLoadingUser } = useAppContext();

    const query = useQuery({
        queryKey: ['home-config', isDemo],
        queryFn: async () => {
            if (isDemo) return null;

            const response = await client.api['home-config'].$get();

            if (!response.ok) {
                throw new Error('Failed to fetch home config')
            }

            const { data } = await response.json();

            return data;
        },
        refetchOnMount: false,
        enabled: !isLoadingUser,
    })

    return query;
}
