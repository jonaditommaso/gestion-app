import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";
import { DEMO_TEAM_MEM_YOU_ID } from "@/lib/demo-data";

export const useGetSentMessages = (options?: { enabled?: boolean; archived?: boolean }) => {
    const { isDemo, isLoadingTeamContext } = useAppContext();
    const demoData = useDemoData();
    const archived = options?.archived ?? false;

    const query = useQuery({
        queryKey: ['messages', 'sent', isDemo, archived],
        queryFn: async () => {
            if (isDemo) {
                const documents = demoData.messages.filter(message => {
                    if (message.fromTeamMemberId !== DEMO_TEAM_MEM_YOU_ID) return false;
                    if (message.deletedBySender) return false;

                    const isArchived = message.archivedBySender ?? false;
                    return archived ? isArchived : !isArchived;
                });

                return { documents, total: documents.length };
            }

            const response = archived
                ? await client.api.messages.sent.$get({ query: { archived: 'true' } })
                : await client.api.messages.sent.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch sent messages')
            }

            const { data } = await response.json();

            return data;
        },
        enabled: !isLoadingTeamContext && (options?.enabled ?? true),
        refetchOnMount: false
    })

    return query;
}
