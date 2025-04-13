import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.settings['upload-image']['$post']>

export const useUploadImageProfile = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const mutation = useMutation<ResponseType, Error, FormData>({
        mutationFn: async (formData) => {
            const response = await fetch('/api/settings/upload-image', {
                method: 'POST',
                body: formData
            });

            if(!response.ok) {
                throw new Error('Failed updating image')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success('Imagen actualizada con exito. Reinicia si no ves el cambio.');
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['image-profile'] })
        },
        onError: () => {
            toast.error('Hubo un error actualizando la imagen')
        }
    })
    return mutation
}