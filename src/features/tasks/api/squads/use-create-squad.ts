import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.squads.$post, 200>;
type RequestType = InferRequestType<typeof client.api.squads.$post>;

export const useCreateSquad = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.squads.$post({ json });
            if (!response.ok) throw new Error('Failed to create squad');
            return await response.json();
        },
        onSuccess: (_, { json }) => {
            toast.success(t('squad-created'));
            queryClient.invalidateQueries({ queryKey: ['squads', json.workspaceId] });
        },
        onError: () => {
            toast.error(t('squad-create-error'));
        },
    });
};
