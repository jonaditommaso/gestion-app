import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAppContext } from "@/context/AppContext";

type ResponseType = InferResponseType<typeof client.api.members['$post'], 200>
type RequestType = InferRequestType<typeof client.api.members['$post']>

export const useAddMembers = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('team');
    const { isDemo } = useAppContext();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            if (isDemo) {
                toast.error(t('demo-invite-blocked'));
                return { added: 0 } as unknown as ResponseType;
            }

            const response = await client.api.members['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to add members')
            }

            return await response.json()
        },
        onSuccess: ({ added }) => {
            if (isDemo) return;
            toast.success(`${added} miembro${added > 1 ? 's' : ''} agregado${added > 1 ? 's' : ''}`)
            queryClient.invalidateQueries({ queryKey: ['members'] })
        },
        onError: () => {
            toast.error('Hubo un error agregando los miembros')
        }
    })
    return mutation
}
