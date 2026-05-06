import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetGithubAuthUrl = (workspaceId: string, enabled: boolean) => {
    return useQuery<string>({
        queryKey: ['github-auth-url', workspaceId],
        queryFn: async () => {
            const res = await client.api.github['auth-url'][':workspaceId'].$get({ param: { workspaceId } });
            if (!res.ok) throw new Error('Failed to get GitHub auth URL');
            const { data } = await res.json();
            return data.url;
        },
        enabled: !!workspaceId && enabled,
        staleTime: Infinity,
    });
};
