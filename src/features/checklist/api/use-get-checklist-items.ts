import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetChecklistItemsProps {
    taskId: string;
    enabled?: boolean;
}

export const useGetChecklistItems = ({ taskId, enabled = true }: UseGetChecklistItemsProps) => {
    const query = useQuery({
        queryKey: ['checklist', taskId],
        queryFn: async () => {
            const response = await client.api.checklist.$get({
                query: { taskId }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch checklist items');
            }

            const { data } = await response.json();
            return data;
        },
        enabled: enabled && !!taskId,
    });

    return query;
};
