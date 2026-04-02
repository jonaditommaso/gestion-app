import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.squads[':squadId']['$patch'], 200>;
type RequestType = InferRequestType<typeof client.api.squads[':squadId']['$patch']>;

export const useUpdateSquad = (workspaceId: string) => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param, json }) => {
            const response = await client.api.squads[':squadId'].$patch({ param, json });
            if (!response.ok) throw new Error('Failed to update squad');
            return await response.json();
        },
        onSuccess: () => {
            toast.success(t('squad-updated'));
            queryClient.invalidateQueries({ queryKey: ['squads', workspaceId] });
        },
        onError: () => {
            toast.error(t('squad-update-error'));
        },
    });
};
