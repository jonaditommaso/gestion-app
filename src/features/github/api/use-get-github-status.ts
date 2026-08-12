import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useAppContext } from "@/context/AppContext";
import type { GitHubWorkspaceState } from "../types";

export const useGetGithubStatus = (workspaceId: string) => {
    const { isDemo, isLoadingTeamContext } = useAppContext();

    return useQuery<GitHubWorkspaceState>({
        queryKey: ['github-status', workspaceId, isDemo],
        queryFn: async () => {
            if (isDemo) {
                return {
                    connected: false,
                    repos: [],
                    owner: null,
                } as GitHubWorkspaceState;
            }

            const res = await client.api.github.status[':workspaceId'].$get({ param: { workspaceId } });
            if (!res.ok) throw new Error('Failed to fetch GitHub status');
            const { data } = await res.json();
            return data;
        },
        enabled: !!workspaceId && !isDemo && !isLoadingTeamContext,
        initialData: isDemo ? {
            connected: false,
            repos: [],
            owner: null,
        } as GitHubWorkspaceState : undefined,
    });
};
