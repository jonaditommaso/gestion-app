import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import type { GitHubBranch } from "../types";

export const useGetGithubBranches = (workspaceId: string, owner: string, repo: string) => {
    return useQuery<GitHubBranch[]>({
        queryKey: ['github-branches', workspaceId, owner, repo],
        queryFn: async () => {
            const res = await client.api.github.branches[':workspaceId'][':owner'][':repo'].$get({
                param: { workspaceId, owner, repo },
            });
            if (!res.ok) throw new Error('Failed to fetch branches');
            const { data } = await res.json();
            return data;
        },
        enabled: !!workspaceId && !!owner && !!repo,
        staleTime: 60_000,
    });
};
