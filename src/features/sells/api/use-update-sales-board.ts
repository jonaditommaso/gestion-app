import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<(typeof client.api.sells.boards)[":boardId"]["$patch"]>;
type RequestType = InferRequestType<(typeof client.api.sells.boards)[":boardId"]["$patch"]>;

export const useUpdateSalesBoard = () => {
    const queryClient = useQueryClient();
    const t = useTranslations("sales");

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param, json }) => {
            const response = await client.api.sells.boards[":boardId"]["$patch"]({ param, json });

            if (!response.ok) {
                throw new Error("Failed to update board");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales-boards"] });
            toast.success(t("board.updated"));
        },
        onError: () => {
            toast.error(t("board.update-error"));
        },
    });
};
