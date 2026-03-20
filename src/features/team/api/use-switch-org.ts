import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.team.switch['$post'], 200>;
type RequestType = InferRequestType<typeof client.api.team.switch['$post']>;

export const useSwitchOrg = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.team.switch['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to switch organization');
            }

            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team'] });
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
            queryClient.invalidateQueries({ queryKey: ['home-config'] });
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['sales-boards'] });
            queryClient.invalidateQueries({ queryKey: ['deals'] });
            queryClient.invalidateQueries({ queryKey: ['deal-sellers'] });
            queryClient.invalidateQueries({ queryKey: ['deal-assignees'] });
            queryClient.invalidateQueries({ queryKey: ['sales-goals'] });
            queryClient.invalidateQueries({ queryKey: ['pipeline-health'] });
        }
    });

    return mutation;
};
