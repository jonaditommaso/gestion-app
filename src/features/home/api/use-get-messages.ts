import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";
import { DEMO_TEAM_MEM_YOU_ID } from "@/lib/demo-data";

export const useGetMessages = (options?: { enabled?: boolean }) => {
    const { isDemo, isLoadingTeamContext } = useAppContext();
    const demoData = useDemoData();

    const query = useQuery({
        queryKey: ['messages', isDemo],
        queryFn: async () => {
            if (isDemo) {
                const documents = demoData.messages.filter(message => message.toTeamMemberId === DEMO_TEAM_MEM_YOU_ID);
                return { documents, total: documents.length };
            }

            const response = await client.api.messages.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch messages')
            }

            const { data } = await response.json();

            return data;
        },
        refetchOnMount: false,
        enabled: !isLoadingTeamContext && (options?.enabled ?? true),
    })

    return query;
}