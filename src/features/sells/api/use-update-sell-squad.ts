import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.sells.squads[":squadId"]["$patch"], 200>;
type RequestType = InferRequestType<typeof client.api.sells.squads[":squadId"]["$patch"]>;

export const useUpdateSellSquad = () => {
    const queryClient = useQueryClient();
    const t = useTranslations("sales");

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param, json }) => {
            const response = await client.api.sells.squads[":squadId"].$patch({ param, json });
            if (!response.ok) throw new Error("Failed to update sell squad");
            return await response.json();
        },
        onSuccess: () => {
            toast.success(t("squads.squad-updated"));
            queryClient.invalidateQueries({ queryKey: ["sell-squads"] });
        },
        onError: () => {
            toast.error(t("squads.squad-update-error"));
        },
    });
};
