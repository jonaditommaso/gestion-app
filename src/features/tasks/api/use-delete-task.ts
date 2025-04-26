import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.tasks[':taskId']['$delete'], 200>
type RequestType = InferRequestType<typeof client.api.tasks[':taskId']['$delete']>

export const useDeleteTask = () => {
    const router = useRouter()
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.tasks[':taskId']['$delete']({ param });

            if(!response.ok) {
                throw new Error('Failed to delete task')
            }

            return await response.json()
        },
        onSuccess: ({ data }) => {
            toast.success(t('task-deleted'));

            router.refresh()
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['task', data.$id] });
        },
        onError: () => {
            toast.error(t('failed-delete-task'))
        }
    })
    return mutation
}