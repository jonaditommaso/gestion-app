import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.sells.squads[":squadId"]["members"][":sellerId"]["$delete"], 200>;
type RequestType = InferRequestType<typeof client.api.sells.squads[":squadId"]["members"][":sellerId"]["$delete"]>;

export const useRemoveSellSquadMember = () => {
    const queryClient = useQueryClient();
    const t = useTranslations("sales");

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.sells.squads[":squadId"].members[":sellerId"].$delete({ param });
            if (!response.ok) throw new Error("Failed to remove sell squad member");
            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sell-squads"] });
        },
        onError: () => {
            toast.error(t("squads.squad-member-add-error"));
        },
    });
};
