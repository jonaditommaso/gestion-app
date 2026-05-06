import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { GitHubRepo } from "../types";

export const useAddGithubRepo = (workspaceId: string) => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    return useMutation<GitHubRepo, Error, GitHubRepo>({
        mutationFn: async (repo) => {
            const res = await client.api.github.repos[':workspaceId'].$post({
                param: { workspaceId },
                json: { repo },
            });
            if (!res.ok) {
                const err = await res.json() as { error?: string };
                if (err.error === 'Plan limit reached') throw new Error('plan_limit');
                throw new Error(err.error ?? 'Failed to add repository');
            }
            const { data } = await res.json();
            return data;
        },
        onSuccess: () => {
            toast.success(t('github-repo-added'));
            queryClient.invalidateQueries({ queryKey: ['github-status', workspaceId] });
        },
        onError: (error) => {
            if (error.message === 'plan_limit') {
                toast.error(t('github-repo-limit-reached'));
            } else {
                toast.error(t('github-repo-add-error'));
            }
        },
    });
};
