import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { TaskComment } from "../../types";
import { withTimeout } from "@/lib/request-timeout";

type ResponseType = InferResponseType<typeof client.api.comments['$post'], 200>
type RequestType = InferRequestType<typeof client.api.comments['$post']>

interface CommentsData {
    documents: TaskComment[];
    total: number;
}

interface OptimisticContext {
    previousComments: CommentsData | undefined;
}

export const useCreateTaskComment = (currentMember?: { $id: string; name: string; email: string }) => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, RequestType, OptimisticContext>({
        mutationFn: async ({ json }) => {
            // Wrap the request with a 15 second timeout
            const response = await withTimeout(
                client.api.comments['$post']({ json })
            );

            if (!response.ok) {
                // Check for specific error types
                const errorData = await response.json() as { error?: string };
                if (errorData.error === 'content_too_long') {
                    throw new Error('content_too_long');
                }
                throw new Error('Failed to create comment')
            }

            return await response.json()
        },
        onMutate: async (variables) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['task-comments', variables.json.taskId] });

            // Snapshot previous value
            const previousComments = queryClient.getQueryData<CommentsData>(['task-comments', variables.json.taskId]);

            // Optimistically update with new comment at the beginning (since ordered by desc)
            if (previousComments && currentMember) {
                const optimisticComment: TaskComment = {
                    $id: `temp-${Date.now()}`,
                    $createdAt: new Date().toISOString(),
                    $updatedAt: new Date().toISOString(),
                    $collectionId: '',
                    $databaseId: '',
                    $permissions: [],
                    taskId: variables.json.taskId,
                    authorMemberId: currentMember.$id,
                    content: variables.json.content,
                    author: currentMember as TaskComment['author']
                };

                queryClient.setQueryData<CommentsData>(['task-comments', variables.json.taskId], {
                    ...previousComments,
                    documents: [optimisticComment, ...previousComments.documents],
                    total: previousComments.total + 1
                });
            }

            return { previousComments };
        },
        onError: (error, variables, context) => {
            // Rollback on error - restore previous state immediately
            if (context?.previousComments) {
                queryClient.setQueryData(['task-comments', variables.json.taskId], context.previousComments);
            }
            if (error.message === 'content_too_long') {
                toast.error(t('comment-too-long'));
            } else {
                toast.error(t('failed-create-comment'));
            }
        },
        onSuccess: (_data, variables) => {
            toast.success(t('comment-created'))
            // Only invalidate on success to sync with server (replaces temp ID with real one)
            queryClient.invalidateQueries({ queryKey: ['task-comments', variables.json.taskId] })
        }
    })
    return mutation
}
