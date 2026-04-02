import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.sells.boards.$post>;
type RequestType = InferRequestType<typeof client.api.sells.boards.$post>;

export const useCreateSalesBoard = () => {
    const queryClient = useQueryClient();
    const t = useTranslations("sales");

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.sells.boards.$post({ json });

            if (!response.ok) {
                throw new Error("Failed to create board");
            }

            return response.json();
        },
        onSuccess: () => {
            toast.success(t("board.created"));
            queryClient.invalidateQueries({ queryKey: ["sales-boards"] });
        },
        onError: () => {
            toast.error(t("board.create-error"));
        },
    });
};
