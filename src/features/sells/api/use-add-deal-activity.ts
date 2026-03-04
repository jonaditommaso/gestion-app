import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
    (typeof client.api.sells)[":dealId"]["comments"]["$post"]
>;
type RequestType = InferRequestType<
    (typeof client.api.sells)[":dealId"]["comments"]["$post"]
>;

export const useAddDealActivity = () => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param, json }) => {
            const response = await client.api.sells[":dealId"]["comments"]["$post"]({
                param,
                json,
            });

            if (!response.ok) {
                throw new Error("Failed to add activity");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deals"] });
        },
    });
};
