import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import type { GitHubWorkspaceState } from "../types";

export const useGetGithubStatus = (workspaceId: string) => {
    return useQuery<GitHubWorkspaceState>({
        queryKey: ['github-status', workspaceId],
        queryFn: async () => {
            const res = await client.api.github.status[':workspaceId'].$get({ param: { workspaceId } });
            if (!res.ok) throw new Error('Failed to fetch GitHub status');
            const { data } = await res.json();
            return data;
        },
        enabled: !!workspaceId,
    });
};
