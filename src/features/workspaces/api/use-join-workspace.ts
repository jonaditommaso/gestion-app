import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.workspaces[':workspaceId']['join']['$post'], 200>
type RequestType = InferRequestType<typeof client.api.workspaces[':workspaceId']['join']['$post']>

export const useJoinWorkspace = () => { //todo, without translation because we are not handling this way to join yet
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param, json }) => {
            const response = await client.api.workspaces[':workspaceId']['join']['$post']({ param, json })

            if(!response.ok) {
                throw new Error('Failed to join')
            }

            return await response.json();
        },
        onSuccess: ({ data }) => {
            toast.success('Te has unido a un nuevo workspace')
            queryClient.invalidateQueries({ queryKey: ['workspaces'] })
            queryClient.invalidateQueries({ queryKey: ['workspace', data.$id] })
        },
        onError: () => {
            toast.error('Hubo un error al unirse')
        }
    })

    return mutation
}