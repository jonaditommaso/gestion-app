import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.roles[':roleId']['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.roles[':roleId']['$patch']>

export const useUpdateRolePermissions = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const t = useTranslations('roles');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json, param }) => {
            const response = await client.api.roles[':roleId']['$patch']({ json, param });

            if (!response.ok) {
                throw new Error('Failed to update roles permissions')
            }

            return await response.json()
        },
        onSuccess: ({ data }) => {
            toast.success(t('role-updated'))

            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['roles'] })
            queryClient.invalidateQueries({ queryKey: ['role', data.$id] })
        },
        onError: () => {
            toast.error(t('failed-update-roles-permissions'))
        }
    })
    return mutation
}