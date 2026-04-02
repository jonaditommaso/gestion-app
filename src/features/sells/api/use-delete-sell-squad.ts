import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.sells.squads[":squadId"]["$delete"], 200>;
type RequestType = InferRequestType<typeof client.api.sells.squads[":squadId"]["$delete"]>;

export const useDeleteSellSquad = () => {
    const queryClient = useQueryClient();
    const t = useTranslations("sales");

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.sells.squads[":squadId"].$delete({ param });
            if (!response.ok) throw new Error("Failed to delete sell squad");
            return await response.json();
        },
        onSuccess: () => {
            toast.success(t("squads.squad-deleted"));
            queryClient.invalidateQueries({ queryKey: ["sell-squads"] });
        },
        onError: () => {
            toast.error(t("squads.squad-delete-error"));
        },
    });
};
