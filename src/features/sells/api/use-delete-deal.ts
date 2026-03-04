import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<(typeof client.api.sells)[":dealId"]["$delete"]>;
type RequestType = InferRequestType<(typeof client.api.sells)[":dealId"]["$delete"]>;

export const useDeleteDeal = () => {
    const queryClient = useQueryClient();
    const t = useTranslations("sales");

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.sells[":dealId"]["$delete"]({ param });

            if (!response.ok) {
                throw new Error("Failed to delete deal");
            }

            return response.json();
        },
        onSuccess: () => {
            toast.success(t("deal-deleted"));
            queryClient.invalidateQueries({ queryKey: ["deals"] });
        },
        onError: () => {
            toast.error(t("deal-delete-error"));
        },
    });
};
