import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAppContext } from "@/context/AppContext";
import type { Models } from "node-appwrite";

type ShortcutSlot = 'shortcut' | 'shortcut2';

export const useDeleteShortcut = () => {
    const router = useRouter()
    const queryClient = useQueryClient();
    const t = useTranslations('home');
    const { isDemo } = useAppContext();

    const mutation = useMutation<{ success: boolean }, Error, { slot: ShortcutSlot }>({
        mutationFn: async ({ slot }) => {
            if (isDemo) {
                queryClient.setQueryData<Models.User<Models.Preferences>>(['current'], (old) => {
                    if (!old) return old;
                    const prefs = { ...old.prefs };
                    delete prefs[slot];
                    return { ...old, prefs };
                });
                return { success: true };
            }

            const response = await client.api.shortcut[':slot'].$delete({
                param: { slot }
            });

            if (!response.ok) {
                throw new Error('Failed to delete shortcut')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('shortcut-deleted'))
            if (!isDemo) {
                router.refresh();
                queryClient.invalidateQueries({ queryKey: ['current'] })
            }
        },
        onError: () => {
            toast.error(t('failed-delete-shortcut'))
        }
    })
    return mutation
}
