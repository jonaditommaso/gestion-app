import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAppContext } from "@/context/AppContext";

type ResponseType = InferResponseType<typeof client.api.team.invite['$post'], 200>
type RequestType = InferRequestType<typeof client.api.team.invite['$post']>
type ErrorResponse = {
    errorCode?: string;
}

export const useInviteMember = () => {
    const router = useRouter()
    const queryClient = useQueryClient();
    const t = useTranslations('team');
    const { isDemo } = useAppContext();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            if (isDemo) {
                toast.error(t('demo-invite-blocked'));
                return { success: false } as unknown as ResponseType;
            }

            const response = await client.api.team.invite['$post']({ json });

            if (!response.ok) {
                const errorResponse = await response.json() as ErrorResponse;
                throw new Error(errorResponse.errorCode ?? 'invite-unknown-error')
            }

            return await response.json()
        },
        onSuccess: (data, variables, context) => {
            if (isDemo) return;
            toast.success(t('invitation-created'))
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['team'] })
        },
        onError: (error) => {
            if (error.message === 'invite-user-not-found') {
                toast.error(t('invite-existing-user-not-found'))
                return;
            }

            toast.error(t('failed-create-invitation'))
        }
    })
    return mutation
}