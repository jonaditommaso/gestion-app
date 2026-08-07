import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";

export const useGetNotes = () => {
    const { isDemo, isLoadingTeamContext } = useAppContext();
    const demoData = useDemoData();

    const query = useQuery({
        queryKey: ['notes', isDemo],
        queryFn: async () => {
            if (isDemo) {
                return { documents: demoData.notes, total: demoData.notes.length };
            }

            const response = await client.api.notes.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch notes')
            }

            const { data } = await response.json();

            return data;
        },
        enabled: !isLoadingTeamContext,
    })

    return query;
}