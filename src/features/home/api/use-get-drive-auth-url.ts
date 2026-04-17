import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api['drive-auth-url']['$get'], 200>

export const useGetDriveAuthUrl = ({ enabled }: { enabled: boolean }) => {
    return useQuery<ResponseType, Error>({
        queryKey: ['drive-auth-url'],
        enabled,
        queryFn: async () => {
            const res = await client.api['drive-auth-url']['$get']();
            if (!res.ok) throw new Error('Failed to get Drive auth URL');
            return await res.json();
        }
    });
};
