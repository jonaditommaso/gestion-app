import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.sells['gmail-auth-url']['$get'], 200>

export const useGetGmailAuthUrl = ({ enabled }: { enabled: boolean }) => {
    return useQuery<ResponseType, Error>({
        queryKey: ['gmail-auth-url'],
        enabled,
        queryFn: async () => {
            const res = await client.api.sells['gmail-auth-url']['$get']();
            if (!res.ok) throw new Error('Failed to get Gmail auth URL');
            return await res.json();
        }
    });
};
