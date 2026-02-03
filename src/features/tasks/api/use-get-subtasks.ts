import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

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
    const query = useQuery({
        queryKey: ['subtasks', parentId],
        queryFn: async () => {
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
        enabled: enabled && !!parentId && !!workspaceId
    })

    return query;
}
