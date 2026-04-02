import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
    (typeof client.api.sells)[":dealId"]["assignees"]["$post"],
    200
>;
type RequestType = InferRequestType<
    (typeof client.api.sells)[":dealId"]["assignees"]["$post"]
>;

export const useAddDealAssignee = () => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param, json }) => {
            const response = await client.api.sells[":dealId"]["assignees"]["$post"]({
                param,
                json,
            });

            if (!response.ok) {
                throw new Error("Failed to add deal assignee");
            }

            return response.json();
        },
        onSuccess: (_data, { param }) => {
            queryClient.invalidateQueries({ queryKey: ["deal-assignees", param.dealId] });
            queryClient.invalidateQueries({ queryKey: ["deals"] });
        },
    });
};
