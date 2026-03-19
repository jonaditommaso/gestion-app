import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<typeof client.api.sso.$post, 200>;
type RequestType = InferRequestType<typeof client.api.sso.$post>;

export const useUpsertSsoConfig = () => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.sso.$post({ json });

            if (!response.ok) {
                throw new Error('Failed to save SSO config');
            }

            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sso', 'config'] });
        },
    });
};
