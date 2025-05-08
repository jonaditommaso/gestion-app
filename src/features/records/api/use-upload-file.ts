import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.records['upload-file'][':recordId']['$post']>

export const useUploadFile = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('records')
    const router = useRouter();

    const params = useParams();
    const recordId: string = params.recordId as string

    const mutation = useMutation<ResponseType, Error, FormData>({
        mutationFn: async (formData) => {
            const response = await fetch(`/api/records/upload-file/${recordId}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed updating file')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('file-uploaded'));
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['files'] })
        },
        onError: () => {
            toast.error(t('failed-upload-file'))
        }
    })
    return mutation
}