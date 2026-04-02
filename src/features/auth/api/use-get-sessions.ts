import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.auth.sessions.$get, 200>;

export type AuthSession = ResponseType['data'][number];

export const useGetSessions = () => {
    return useQuery({
        queryKey: ['auth', 'sessions'],
        queryFn: async () => {
            const response = await client.api.auth.sessions.$get();

            if (!response.ok) {
                throw new Error('Failed to get sessions');
            }

            const { data } = await response.json();
            return data;
        },
    });
};
