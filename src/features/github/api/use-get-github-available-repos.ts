import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import type { GitHubRepo } from "../types";

export const useGetGithubAvailableRepos = (workspaceId: string, enabled: boolean) => {
    return useQuery<GitHubRepo[]>({
        queryKey: ['github-available-repos', workspaceId],
        queryFn: async () => {
            const res = await client.api.github['available-repos'][':workspaceId'].$get({ param: { workspaceId } });
            if (!res.ok) {
                const err = await res.json() as { error?: string };
                throw new Error(err.error ?? 'Failed to fetch repositories');
            }
            const { data } = await res.json();
            return data;
        },
        enabled: !!workspaceId && enabled,
    });
};
