import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.tasks[':taskId']['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.tasks[':taskId']['$patch']>

export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json, param }) => {
            const response = await client.api.tasks[':taskId']['$patch']({ json, param });

            if (!response.ok) {
                throw new Error('Failed to update task')
            }

            return await response.json()
        },
        onSuccess: ({ data }) => {
            // toast.success(t('task-updated'))

            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            queryClient.invalidateQueries({ queryKey: ['task', data.$id] })
        },
        onError: () => {
            toast.error(t('failed-update-task'))
        }
    })
    return mutation
}