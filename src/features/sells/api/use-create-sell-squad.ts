import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.sells.squads.$post, 200>;
type RequestType = InferRequestType<typeof client.api.sells.squads.$post>;

export const useCreateSellSquad = () => {
    const queryClient = useQueryClient();
    const t = useTranslations("sales");

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.sells.squads.$post({ json });
            if (!response.ok) throw new Error("Failed to create sell squad");
            return await response.json();
        },
        onSuccess: () => {
            toast.success(t("squads.squad-created"));
            queryClient.invalidateQueries({ queryKey: ["sell-squads"] });
        },
        onError: () => {
            toast.error(t("squads.squad-create-error"));
        },
    });
};
