import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.sells.squads[":squadId"]["members"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.sells.squads[":squadId"]["members"]["$post"]>;

export const useAddSellSquadMember = () => {
    const queryClient = useQueryClient();
    const t = useTranslations("sales");

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param, json }) => {
            const response = await client.api.sells.squads[":squadId"].members.$post({ param, json });
            if (!response.ok) throw new Error("Failed to add sell squad member");
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
