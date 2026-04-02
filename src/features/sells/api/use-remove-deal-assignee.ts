import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
    (typeof client.api.sells)[":dealId"]["assignees"][":assigneeId"]["$delete"],
    200
>;
type RequestType = InferRequestType<
    (typeof client.api.sells)[":dealId"]["assignees"][":assigneeId"]["$delete"]
>;

export const useRemoveDealAssignee = () => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.sells[":dealId"]["assignees"][":assigneeId"]["$delete"]({
                param,
            });

            if (!response.ok) {
                throw new Error("Failed to remove deal assignee");
            }

            return response.json();
        },
        onSuccess: (_data, { param }) => {
            queryClient.invalidateQueries({ queryKey: ["deal-assignees", param.dealId] });
            queryClient.invalidateQueries({ queryKey: ["deals"] });
        },
    });
};
