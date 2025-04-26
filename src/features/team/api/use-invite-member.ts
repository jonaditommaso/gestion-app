import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.team.invite['$post'], 200>
type RequestType = InferRequestType<typeof client.api.team.invite['$post']>

export const useInviteMember = () => {
    const router = useRouter()
    const queryClient = useQueryClient();
    const t = useTranslations('team');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json }) => {
            const response = await client.api.team.invite['$post']({ json });

            if(!response.ok) {
                throw new Error('Failed to create invitation')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('invitation-created'))
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['team'] })
        },
        onError: () => {
            toast.error(t('failed-create-invitation'))
        }
    })
    return mutation
}