import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.roles['$post'], 200>
type RequestType = InferRequestType<typeof client.api.roles['$post']>

export const useCreateRolePermissions = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const t = useTranslations('roles');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.roles['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to create roles permissions')
            }

            return await response.json()
        },
        onSuccess: ({ data }) => {
            toast.success(t('role-created'))

            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['roles'] })
            queryClient.invalidateQueries({ queryKey: ['role', data.$id] })
        },
        onError: () => {
            toast.error(t('failed-create-roles-permissions'))
        }
    })
    return mutation
}