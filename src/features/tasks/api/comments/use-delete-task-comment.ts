import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { TaskComment } from "../../types";
import { withTimeout } from "@/lib/request-timeout";

type ResponseType = InferResponseType<typeof client.api.comments[':commentId']['$delete'], 200>
type RequestType = InferRequestType<typeof client.api.comments[':commentId']['$delete']>

interface CommentsData {
    documents: TaskComment[];
    total: number;
}

interface OptimisticContext {
    previousComments: CommentsData | undefined;
    taskId: string | undefined;
}

export const useDeleteTaskComment = (taskId?: string) => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, RequestType, OptimisticContext>({
        mutationFn: async ({ param }) => {
            // Wrap the request with a 15 second timeout
            const response = await withTimeout(
                client.api.comments[':commentId']['$delete']({ param })
            );

            if (!response.ok) {
                throw new Error('Failed to delete comment')
            }

            return await response.json()
        },
        onMutate: async (variables) => {
            if (!taskId) return { previousComments: undefined, taskId: undefined };

            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['task-comments', taskId] });

            // Snapshot previous value
            const previousComments = queryClient.getQueryData<CommentsData>(['task-comments', taskId]);

            // Optimistically remove the comment
            if (previousComments) {
                queryClient.setQueryData<CommentsData>(['task-comments', taskId], {
                    ...previousComments,
                    documents: previousComments.documents.filter(c => c.$id !== variables.param.commentId),
                    total: Math.max(0, previousComments.total - 1)
                });
            }

            return { previousComments, taskId };
        },
        onError: (_, __, context) => {
            // Rollback on error - restore previous state immediately
            if (context?.previousComments && context?.taskId) {
                queryClient.setQueryData(['task-comments', context.taskId], context.previousComments);
            }
            toast.error(t('failed-delete-comment'))
        },
        onSuccess: (_data, _variables, context) => {
            toast.success(t('comment-deleted'))
            // Only invalidate on success to sync with server
            if (context?.taskId) {
                queryClient.invalidateQueries({ queryKey: ['task-comments', context.taskId] })
            }
        }
    })
    return mutation
}
