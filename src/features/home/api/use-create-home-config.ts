import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api['home-config']['$post'], 200>;
type RequestType = InferRequestType<typeof client.api['home-config']['$post']>;

export const useCreateHomeConfig = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api['home-config']['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to create home config');
            }

            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['home-config'] });
        },
    });

    return mutation;
};
