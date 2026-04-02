import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";

export const useGetMessages = (options?: { enabled?: boolean }) => {
    const { isDemo, isLoadingUser } = useAppContext();
    const demoData = useDemoData();

    const query = useQuery({
        queryKey: ['messages', isDemo],
        queryFn: async () => {
            if (isDemo) {
                return { documents: demoData.messages, total: demoData.messages.length };
            }

            const response = await client.api.messages.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch messages')
            }

            const { data } = await response.json();

            return data;
        },
        refetchOnMount: false,
        enabled: !isLoadingUser && (options?.enabled ?? true),
    })

    return query;
}