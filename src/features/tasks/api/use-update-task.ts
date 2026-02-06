import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Task } from "../types";

type ResponseType = InferResponseType<typeof client.api.tasks[':taskId']['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.tasks[':taskId']['$patch']>

interface MutationContext {
    previousTask?: { data: Task };
    previousTasks?: { data: { documents: Task[] } };
}

export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, RequestType, MutationContext>({
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
        onMutate: async ({ json, param }) => {
            const taskId = param.taskId;

            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['task', taskId] });
            await queryClient.cancelQueries({ queryKey: ['tasks'] });

            // Snapshot previous values
            const previousTask = queryClient.getQueryData<{ data: Task }>(['task', taskId]);
            const previousTasks = queryClient.getQueryData<{ data: { documents: Task[] } }>(['tasks']);

            // Buscar la tarea en previousTasks si no está en previousTask
            const taskFromList = previousTasks?.data?.documents?.find(t => t.$id === taskId);
            const parentId = previousTask?.data?.parentId || taskFromList?.parentId;

            // Si se está archivando, remover de la lista optimistamente
            if (json.archived === true) {
                // Optimistically remove from tasks list
                if (previousTasks?.data?.documents) {
                    queryClient.setQueryData(['tasks'], {
                        ...previousTasks,
                        data: {
                            ...previousTasks.data,
                            documents: previousTasks.data.documents.filter(task => task.$id !== taskId)
                        }
                    });
                }

                // Optimistically remove from subtasks if this is a subtask
                if (parentId) {
                    await queryClient.cancelQueries({ queryKey: ['subtasks', parentId] });
                    const previousSubtasks = queryClient.getQueryData<{ data: { documents: Task[] } }>(['subtasks', parentId]);

                    if (previousSubtasks?.data?.documents) {
                        queryClient.setQueryData(['subtasks', parentId], {
                            ...previousSubtasks,
                            data: {
                                ...previousSubtasks.data,
                                documents: previousSubtasks.data.documents.filter(task => task.$id !== taskId)
                            }
                        });
                    }
                }
            } else {
                // Normal update: actualizar la tarea optimistamente
                if (previousTask?.data) {
                    queryClient.setQueryData(['task', taskId], {
                        ...previousTask,
                        data: { ...previousTask.data, ...json }
                    });
                }

                // Optimistically update tasks list
                if (previousTasks?.data?.documents) {
                    queryClient.setQueryData(['tasks'], {
                        ...previousTasks,
                        data: {
                            ...previousTasks.data,
                            documents: previousTasks.data.documents.map(task =>
                                task.$id === taskId ? { ...task, ...json } : task
                            )
                        }
                    });
                }

                // Optimistically update subtasks if this is a subtask
                if (parentId) {
                    await queryClient.cancelQueries({ queryKey: ['subtasks', parentId] });
                    const previousSubtasks = queryClient.getQueryData<{ data: { documents: Task[] } }>(['subtasks', parentId]);

                    if (previousSubtasks?.data?.documents) {
                        queryClient.setQueryData(['subtasks', parentId], {
                            ...previousSubtasks,
                            data: {
                                ...previousSubtasks.data,
                                documents: previousSubtasks.data.documents.map(task =>
                                    task.$id === taskId ? { ...task, ...json } : task
                                )
                            }
                        });
                    }
                }
            }

            return { previousTask, previousTasks };
        },
        onSuccess: ({ data }) => {
            // toast.success(t('task-updated'))

            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            queryClient.invalidateQueries({ queryKey: ['task', data.$id] })
            queryClient.invalidateQueries({ queryKey: ['task-activity-logs', data.$id] })
            // Invalidate subtasks if this task is a subtask (has parentId)
            if (data.parentId) {
                queryClient.invalidateQueries({ queryKey: ['subtasks', data.parentId] })
            }
            // Invalidate subtasks if this task is an epic (could have subtasks)
            if (data.type === 'epic') {
                queryClient.invalidateQueries({ queryKey: ['subtasks', data.$id] })
            }
        },
        onError: (error, variables, context) => {
            // Rollback on error
            if (context?.previousTask) {
                queryClient.setQueryData(['task', variables.param.taskId], context.previousTask);
            }
            if (context?.previousTasks) {
                queryClient.setQueryData(['tasks'], context.previousTasks);
            }

            if (error.message === 'content_too_long') {
                toast.error(t('content-too-long'));
            } else {
                toast.error(t('failed-update-task'));
            }
        }
    })
    return mutation
}