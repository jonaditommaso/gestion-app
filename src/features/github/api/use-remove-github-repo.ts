import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export const useRemoveGithubRepo = (workspaceId: string) => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    return useMutation<{ success: boolean }, Error, string>({
        mutationFn: async (repoId) => {
            const res = await client.api.github.repos[':workspaceId'][':repoId'].$delete({
                param: { workspaceId, repoId: String(repoId) },
            });
            if (!res.ok) throw new Error('Failed to remove repository');
            const { data } = await res.json();
            return data;
        },
        onSuccess: () => {
            toast.success(t('github-repo-removed'));
            queryClient.invalidateQueries({ queryKey: ['github-status', workspaceId] });
        },
        onError: () => {
            toast.error(t('github-repo-remove-error'));
        },
    });
};
