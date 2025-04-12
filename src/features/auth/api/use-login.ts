import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { setCookie } from 'cookies-next';

type ResponseType = InferResponseType<typeof client.api.auth.login['$post'], 200>
type RequestType = InferRequestType<typeof client.api.auth.login['$post']>

export const useLogin = () => {
    const router = useRouter()
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json}) => {
            const response = await client.api.auth.login['$post']({ json });

            if(!response.ok) {
                throw new Error('Failed to login')
            }

            return await response.json()
        },
        onSuccess: ({ data }) => {
            if (data.mfaRequired) {
                const token = crypto.randomUUID();
                setCookie('mfa_token', token);
                router.push(`/mfa?token=${token}&challengeId=${data.challengeId}`);
            } else {
                router.refresh();
                queryClient.invalidateQueries({ queryKey: ['current'] })
            }
        }
    })
    return mutation
}