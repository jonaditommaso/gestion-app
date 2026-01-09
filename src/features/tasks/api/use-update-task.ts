import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.tasks[':taskId']['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.tasks[':taskId']['$patch']>

export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json, param }) => {
            const response = await client.api.tasks[':taskId']['$patch']({ json, param });

            if (!response.ok) {
                // Check for specific error types
                const errorData = await response.json() as { error?: string };
                if (errorData.error === 'content_too_long') {
                    throw new Error('content_too_long');
                }
                throw new Error('Failed to update task')
            }

            return await response.json()
        },
        onSuccess: ({ data }) => {
            // toast.success(t('task-updated'))

            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            queryClient.invalidateQueries({ queryKey: ['task', data.$id] })
            queryClient.invalidateQueries({ queryKey: ['task-activity-logs', data.$id] })
        },
        onError: (error) => {
            if (error.message === 'content_too_long') {
                toast.error(t('content-too-long'));
            } else {
                toast.error(t('failed-update-task'));
            }
        }
    })
    return mutation
}