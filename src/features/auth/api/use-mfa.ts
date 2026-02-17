import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.auth.mfa['$post'], 200>
type RequestType = InferRequestType<typeof client.api.auth.mfa['$post']>

export const useMfa = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.auth.mfa['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to login')
            }

            return await response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['current'] })
            router.replace('/');
            router.refresh();
        }
    })
    return mutation
}