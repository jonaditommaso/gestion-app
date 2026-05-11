import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.sells['trello']['auth-url']['$get'], 200>

export const useGetTrelloAuthUrl = ({ enabled }: { enabled: boolean }) => {
    return useQuery<ResponseType, Error>({
        queryKey: ['trello-auth-url'],
        enabled,
        queryFn: async () => {
            const res = await client.api.sells['trello']['auth-url']['$get']();
            if (!res.ok) throw new Error('Failed to get Trello auth URL');
            return await res.json();
        },
        staleTime: Infinity,
    });
};
