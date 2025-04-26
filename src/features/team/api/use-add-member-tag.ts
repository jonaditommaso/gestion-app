import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.team.tags['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.team.tags['$patch']>

export const useAddMemberTag = () => {
    const router = useRouter()
    const queryClient = useQueryClient();
    const t = useTranslations('team');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json }) => {
            const response = await client.api.team.tags['$patch']({ json });

            if(!response.ok) {
                throw new Error('Failed to create tag')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('tag-added')) // ver si traducirlo como etiqueta en español
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['member-tag'] })
        },
        onError: () => {
            toast.error(t('failed-create-tag'))
        }
    })
    return mutation
}