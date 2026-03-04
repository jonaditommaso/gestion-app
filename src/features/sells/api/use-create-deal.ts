import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.sells.$post>;
type RequestType = InferRequestType<typeof client.api.sells.$post>;

export const useCreateDeal = () => {
    const queryClient = useQueryClient();
    const t = useTranslations("sales");

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.sells.$post({ json });

            if (!response.ok) {
                throw new Error("Failed to create deal");
            }

            return response.json();
        },
        onSuccess: () => {
            toast.success(t("deal-created"));
            queryClient.invalidateQueries({ queryKey: ["deals"] });
        },
        onError: () => {
            toast.error(t("deal-create-error"));
        },
    });
};
