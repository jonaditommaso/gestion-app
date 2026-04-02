import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<
    (typeof client.api.sells.sellers)[":sellerId"]["$delete"]
>;
type RequestType = InferRequestType<
    (typeof client.api.sells.sellers)[":sellerId"]["$delete"]
>;

export const useDeleteDealSeller = () => {
    const queryClient = useQueryClient();
    const t = useTranslations("sales");

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.sells.sellers[":sellerId"]["$delete"]({ param });

            if (!response.ok) {
                throw new Error("Failed to delete seller");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deal-sellers"] });
        },
        onError: () => {
            toast.error(t("seller-delete-error"));
        },
    });
};
