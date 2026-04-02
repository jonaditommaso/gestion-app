import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.squads[':squadId']['tasks'][':taskId']['$delete'], 200>;
type RequestType = InferRequestType<typeof client.api.squads[':squadId']['tasks'][':taskId']['$delete']>;

export const useUnassignSquadFromTask = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.squads[':squadId'].tasks[':taskId'].$delete({ param });
            if (!response.ok) throw new Error('Failed to unassign squad');
            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['task'] });
        },
        onError: () => {
            toast.error(t('squad-unassign-error'));
        },
    });
};
