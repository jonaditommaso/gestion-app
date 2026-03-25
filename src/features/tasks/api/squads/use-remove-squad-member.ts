import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.squads[':squadId']['members'][':memberId']['$delete'], 200>;
type RequestType = InferRequestType<typeof client.api.squads[':squadId']['members'][':memberId']['$delete']>;

export const useRemoveSquadMember = (workspaceId: string) => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.squads[':squadId'].members[':memberId'].$delete({ param });
            if (!response.ok) throw new Error('Failed to remove squad member');
            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['squads', workspaceId] });
        },
        onError: () => {
            toast.error(t('squad-member-remove-error'));
        },
    });
};
