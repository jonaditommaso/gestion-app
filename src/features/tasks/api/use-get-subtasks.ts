import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";

interface UseGetSubtasksProps {
    parentId: string;
    workspaceId: string;
    enabled?: boolean;
}

export const useGetSubtasks = ({
    parentId,
    workspaceId,
    enabled = true
}: UseGetSubtasksProps) => {
    const { isDemo, isLoadingUser } = useAppContext();

    const query = useQuery({
        queryKey: ['subtasks', parentId, isDemo],
        queryFn: async () => {
            if (isDemo) return { total: 0, documents: [] };

            const response = await client.api.tasks.subtasks[':parentId'].$get({
                param: { parentId },
                query: { workspaceId }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch subtasks')
            }

            const { data } = await response.json();

            return data;
        },
        retry: false,
        refetchOnMount: true,
        enabled: !isLoadingUser && enabled && !!parentId && !!workspaceId
    })

    return query;
}
