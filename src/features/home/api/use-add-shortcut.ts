import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAppContext } from "@/context/AppContext";
import type { Models } from "node-appwrite";

type ResponseType = InferResponseType<typeof client.api.shortcut['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.shortcut['$patch']>

export const useAddShortcut = () => {
    const router = useRouter()
    const queryClient = useQueryClient();
    const t = useTranslations('home');
    const { isDemo } = useAppContext();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            if (isDemo) {
                const slot = (json.slot as string) ?? 'shortcut';
                queryClient.setQueryData<Models.User<Models.Preferences>>(['current'], (old) => {
                    if (!old) return old;
                    return { ...old, prefs: { ...old.prefs, [slot]: `${json.link},${json.text}` } };
                });
                return { success: true } as unknown as ResponseType;
            }

            const response = await client.api.shortcut['$patch']({ json });

            if (!response.ok) {
                throw new Error('Failed to create shortcut')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('shortcut-created'))
            if (!isDemo) {
                router.refresh();
                queryClient.invalidateQueries({ queryKey: ['current'] })
            }
        },
        onError: () => {
            toast.error(t('failed-create-shortcut'))
        }
    })
    return mutation
}