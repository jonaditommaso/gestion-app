import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.sells.squads[":squadId"]["deals"][":dealId"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.sells.squads[":squadId"]["deals"][":dealId"]["$post"]>;

export const useAssignSquadToDeal = () => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.sells.squads[":squadId"].deals[":dealId"].$post({ param });
            if (!response.ok) throw new Error("Failed to assign squad to deal");
            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sell-squads"] });
        },
    });
};
