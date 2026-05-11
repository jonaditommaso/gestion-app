import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import type { GitHubDevData } from "../types";

export const useGetGithubDevData = (
    workspaceId: string,
    owner: string,
    repo: string,
    branch: string
) => {
    return useQuery<GitHubDevData>({
        queryKey: ['github-dev-data', workspaceId, owner, repo, branch],
        queryFn: async () => {
            const res = await client.api.github['dev-data'][':workspaceId'][':owner'][':repo'].$get({
                param: { workspaceId, owner, repo },
                query: { branch },
            });
            if (!res.ok) throw new Error('Failed to fetch GitHub dev data');
            const { data } = await res.json();
            return data;
        },
        enabled: !!workspaceId && !!owner && !!repo && !!branch,
        staleTime: 60_000,
    });
};
