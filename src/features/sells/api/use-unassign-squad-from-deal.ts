import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.sells.squads[":squadId"]["deals"][":dealId"]["$delete"], 200>;
type RequestType = InferRequestType<typeof client.api.sells.squads[":squadId"]["deals"][":dealId"]["$delete"]>;

export const useUnassignSquadFromDeal = () => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.sells.squads[":squadId"].deals[":dealId"].$delete({ param });
            if (!response.ok) throw new Error("Failed to unassign squad from deal");
            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sell-squads"] });
        },
    });
};
