import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<
    (typeof client.api.sells.boards)[":boardId"]["goals"]["$post"]
>;
type RequestType = InferRequestType<
    (typeof client.api.sells.boards)[":boardId"]["goals"]["$post"]
>;

export const useSetSalesGoal = () => {
    const queryClient = useQueryClient();
    const t = useTranslations("sales");

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param, json }) => {
            const response = await client.api.sells.boards[":boardId"]["goals"].$post({
                param,
                json,
            });

            if (!response.ok) {
                throw new Error("Failed to set goal");
            }

            return response.json();
        },
        onSuccess: (_, variables) => {
            toast.success(t("goal.saved"));
            queryClient.invalidateQueries({ queryKey: ["sales-goals", variables.param.boardId] });
            queryClient.invalidateQueries({ queryKey: ["sales-boards"] });
        },
        onError: () => {
            toast.error(t("goal.save-error"));
        },
    });
};
