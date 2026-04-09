import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";

interface UseGetChecklistItemsProps {
    taskId: string;
    enabled?: boolean;
}

export const useGetChecklistItems = ({ taskId, enabled = true }: UseGetChecklistItemsProps) => {
    const { isDemo, isLoadingUser } = useAppContext();

    const query = useQuery({
        queryKey: ['checklist', taskId, isDemo],
        queryFn: async () => {
            if (isDemo) return { documents: [], total: 0 };

            const response = await client.api.checklist.$get({
                query: { taskId }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch checklist items');
            }

            const { data } = await response.json();
            return data;
        },
        enabled: !isLoadingUser && enabled && !!taskId,
    });

    return query;
};
