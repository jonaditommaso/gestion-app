import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<(typeof client.api.sells)[":dealId"]["$patch"]>;
type RequestType = InferRequestType<(typeof client.api.sells)[":dealId"]["$patch"]>;

export const useUpdateDeal = () => {
    const queryClient = useQueryClient();
    const t = useTranslations("sales");

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param, json }) => {
            const response = await client.api.sells[":dealId"]["$patch"]({ param, json });

            if (!response.ok) {
                throw new Error("Failed to update deal");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deals"] });
        },
        onError: () => {
            toast.error(t("deal-update-error"));
        },
    });
};
