import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = { qr: string };

export const useGetMfaQr = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, void>({
        mutationFn: async () => {
            const response = await client.api.settings['mfa-qr']['$post']();

            if(!response.ok) {
                throw new Error('Failed getting MFA QR')
            }

            return await response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mfa-qr'] })
        },
        onError: () => {
            toast.error('Hubo un error obteniendo MFA QR')
        }
    })
    return mutation
}