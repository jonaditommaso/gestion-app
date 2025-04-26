import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.workspaces['$post']>
type RequestType = InferRequestType<typeof client.api.workspaces['$post']>

export const useCreateWorkspace = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json}) => {
            const response = await client.api.workspaces['$post']({ json });

            if(!response.ok) {
                throw new Error('Failed to create workspace')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('workspace-created'))
            queryClient.invalidateQueries({ queryKey: ['workspaces'] })
        },
        onError: () => {
            toast.error(t('failed-create-workspace'))
        }
    })
    return mutation
}