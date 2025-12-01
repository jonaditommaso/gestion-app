import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.settings['delete-image']['$delete']>

export const useDeleteImageProfile = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const t = useTranslations('settings')

    const mutation = useMutation<ResponseType, Error, void>({
        mutationFn: async () => {
            const response = await client.api.settings['delete-image']['$delete']();

            if (!response.ok) {
                throw new Error('Failed deleting image')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('image-deleted'));
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['image-profile'] })
        },
        onError: () => {
            toast.error(t('failed-delete-image'))
        }
    })
    return mutation
}
