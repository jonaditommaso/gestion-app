import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.tasks[':taskId']['assign']['$post'], 200>;
type RequestType = InferRequestType<typeof client.api.tasks[':taskId']['assign']['$post']>;

export const useAssignTask = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ param, json }) => {
            const response = await client.api.tasks[':taskId']['assign'].$post({
                param,
                json
            });

            if (!response.ok) {
                throw new Error('Failed to assign task');
            }

            return await response.json();
        },
        onSuccess: ({ data }) => {
            toast.success(t('task-assigned-success'));

            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['task', data.$id] });
        },
        onError: (error) => {
            console.error(error);
            toast.error(t('task-assigned-error'));
        }
    });

    return mutation;
};
