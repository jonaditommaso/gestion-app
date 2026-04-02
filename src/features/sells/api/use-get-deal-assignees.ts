import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
    (typeof client.api.sells)[":dealId"]["assignees"]["$get"],
    200
>;

export const useGetDealAssignees = (dealId: string) => {
    return useQuery<ResponseType>({
        queryKey: ["deal-assignees", dealId],
        queryFn: async () => {
            const response = await client.api.sells[":dealId"]["assignees"]["$get"]({
                param: { dealId },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch deal assignees");
            }

            return response.json();
        },
        enabled: !!dealId,
    });
};
