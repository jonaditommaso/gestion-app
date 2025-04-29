import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.team['edit-name']['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.team['edit-name']['$patch']>

export const useEditCompanyName = () => {
    const router = useRouter()
    const queryClient = useQueryClient();
    const t = useTranslations('team');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json }) => {
            const response = await client.api.team['edit-name']['$patch']({ json });

            if(!response.ok) {
                throw new Error('Failed to edit organization name')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('team-created')) //? cuando permita editar el nombre de la company, tengo que hacer condicional esto (created/edited)
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['team', 'current'] })
        },
        onError: () => {
            toast.error(t('failed-create-team'))
        }
    })
    return mutation
}