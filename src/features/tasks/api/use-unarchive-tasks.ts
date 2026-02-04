import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useUnarchiveTasks = () => {
    const t = useTranslations('workspaces');
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (taskIds: string[]) => {
            // Unarchive each task sequentially
            const promises = taskIds.map(taskId =>
                client.api.tasks[':taskId']['$patch']({
                    json: {
                        archived: false,
                        archivedBy: null,
                        archivedAt: null,
                    },
                    param: { taskId }
                })
            );

            const responses = await Promise.all(promises);

            // Check if all requests succeeded
            const allSucceeded = responses.every(r => r.ok);
            if (!allSucceeded) {
                throw new Error('Failed to unarchive some tasks');
            }

            return responses;
        },
        onSuccess: (_, taskIds) => {
            toast.success(t('tasks-unarchived', { count: taskIds.length }));
            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['archived-tasks'] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
        onError: () => {
            toast.error(t('failed-unarchive-tasks'));
        }
    });

    return mutation;
};
