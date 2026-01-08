import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { TaskComment } from "../../types";
import { withTimeout } from "@/lib/request-timeout";

type ResponseType = InferResponseType<typeof client.api.comments[':commentId']['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.comments[':commentId']['$patch']>

interface CommentsData {
    documents: TaskComment[];
    total: number;
}

interface OptimisticContext {
    previousComments: CommentsData | undefined;
    taskId: string | undefined;
}

export const useUpdateTaskComment = (taskId?: string) => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, RequestType, OptimisticContext>({
        mutationFn: async ({ json, param }) => {
            // Wrap the request with a 15 second timeout
            const response = await withTimeout(
                client.api.comments[':commentId']['$patch']({ json, param })
            );

            if (!response.ok) {
                throw new Error('Failed to update comment')
            }

            return await response.json()
        },
        onMutate: async (variables) => {
            if (!taskId) return { previousComments: undefined, taskId: undefined };

            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['task-comments', taskId] });

            // Snapshot previous value
            const previousComments = queryClient.getQueryData<CommentsData>(['task-comments', taskId]);

            // Optimistically update the comment
            if (previousComments) {
                queryClient.setQueryData<CommentsData>(['task-comments', taskId], {
                    ...previousComments,
                    documents: previousComments.documents.map(comment =>
                        comment.$id === variables.param.commentId
                            ? { ...comment, content: variables.json.content, $updatedAt: new Date().toISOString() }
                            : comment
                    )
                });
            }

            return { previousComments, taskId };
        },
        onError: (_, __, context) => {
            // Rollback on error - restore previous state immediately
            if (context?.previousComments && context?.taskId) {
                queryClient.setQueryData(['task-comments', context.taskId], context.previousComments);
            }
            toast.error(t('failed-update-comment'))
        },
        onSuccess: (_data, _variables, context) => {
            toast.success(t('comment-updated'))
            // Only invalidate on success to sync with server
            if (context?.taskId) {
                queryClient.invalidateQueries({ queryKey: ['task-comments', context.taskId] })
            }
        }
    })
    return mutation
}
