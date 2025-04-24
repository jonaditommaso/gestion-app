import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.auth['$delete'], 200>

export const useDeleteAccount = () => {
    const router = useRouter()
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, void>({
        mutationFn: async () => {
            const response = await client.api.auth.$delete();

            if(!response.ok) {
                throw new Error('Failed to delete account')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success('User deleted');

            router.push('/');
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['current'] });
        },
        onError: () => {
            toast.error('Failed to delete account')
        }
    })
    return mutation
}