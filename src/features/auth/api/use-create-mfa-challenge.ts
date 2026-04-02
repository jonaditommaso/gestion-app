import { useMutation } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.auth.mfa.challenge['$post'], 200>

export const useCreateMfaChallenge = () => {
    const mutation = useMutation<ResponseType, Error, void>({
        mutationFn: async () => {
            const response = await client.api.auth.mfa.challenge['$post']();

            if (!response.ok) {
                throw new Error('Failed to create MFA challenge');
            }

            return await response.json();
        }
    });

    return mutation;
}
