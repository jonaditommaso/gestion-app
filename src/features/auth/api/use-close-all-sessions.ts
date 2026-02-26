import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";


type CloseAllSessionsPost = typeof client.api.auth['close-all-sessions']['$post'];
type ResponseType = InferResponseType<CloseAllSessionsPost, 200>;

export const useCloseAllSessions = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation<ResponseType, Error>({
        mutationFn: async () => {
            const response = await client.api.auth['close-all-sessions'].$post();

            if (!response.ok) {
                throw new Error('Failed to close all sessions');
            }

            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] });
            queryClient.invalidateQueries({ queryKey: ['current'] });
            router.push('/login');
        },
    });
};
