import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api['meet-auth-url']['$get'], 200>

export const useGetMeetAuthUrl = ({ enabled }: { enabled: boolean }) => {
    return useQuery<ResponseType, Error>({
        queryKey: ['meet-auth-url'],
        enabled,
        queryFn: async () => {
            const res = await client.api['meet-auth-url']['$get']();
            if (!res.ok) throw new Error('Failed to get auth URL');
            return await res.json();
        }
    });
};
