import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.squads[':squadId']['tasks'][':taskId']['$post'], 200>;
type RequestType = InferRequestType<typeof client.api.squads[':squadId']['tasks'][':taskId']['$post']>;

export const useAssignSquadToTask = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.squads[':squadId'].tasks[':taskId'].$post({ param });
            if (!response.ok) throw new Error('Failed to assign squad');
            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['task'] });
        },
        onError: () => {
            toast.error(t('squad-assign-error'));
        },
    });
};
