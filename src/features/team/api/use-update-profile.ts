import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.team.profile['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.team.profile['$patch']>

export const useUpdateProfile = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const t = useTranslations('team');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.team.profile['$patch']({ json });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success(t('profile-updated'));
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['team', 'member-tag'] });
        },
        onError: () => {
            toast.error(t('failed-update-profile'));
        }
    });

    return mutation;
};
