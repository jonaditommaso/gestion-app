import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export const useDisconnectGithub = (workspaceId: string) => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    return useMutation<{ success: boolean }, Error, void>({
        mutationFn: async () => {
            const res = await client.api.github.disconnect[':workspaceId'].$post({
                param: { workspaceId },
            });
            if (!res.ok) throw new Error('Failed to disconnect GitHub');
            const { data } = await res.json();
            return data;
        },
        onSuccess: () => {
            toast.success(t('github-disconnected'));
            queryClient.invalidateQueries({ queryKey: ['github-status', workspaceId] });
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
        },
        onError: () => {
            toast.error(t('github-disconnect-error'));
        },
    });
};
