import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.squads[':squadId']['$delete'], 200>;
type RequestType = InferRequestType<typeof client.api.squads[':squadId']['$delete']>;

export const useDeleteSquad = (workspaceId: string) => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.squads[':squadId'].$delete({ param });
            if (!response.ok) throw new Error('Failed to delete squad');
            return await response.json();
        },
        onSuccess: () => {
            toast.success(t('squad-deleted'));
            queryClient.invalidateQueries({ queryKey: ['squads', workspaceId] });
        },
        onError: () => {
            toast.error(t('squad-delete-error'));
        },
    });
};
