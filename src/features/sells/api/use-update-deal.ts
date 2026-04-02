import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";
import type { DealWithAssignees } from "@/lib/demo-data";

type ResponseType = InferResponseType<(typeof client.api.sells)[":dealId"]["$patch"], 200>;
type RequestType = InferRequestType<(typeof client.api.sells)[":dealId"]["$patch"]>;

export const useUpdateDeal = () => {
    const queryClient = useQueryClient();
    const t = useTranslations("sales");
    const router = useRouter();
    const { isDemo } = useAppContext();
    const { updateDeal } = useDemoData();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param, json }) => {
            if (isDemo) {
                updateDeal(param.dealId, json as Partial<DealWithAssignees>);
                return { data: { linkedDraftId: null } } as unknown as ResponseType;
            }

            const response = await client.api.sells[":dealId"]["$patch"]({ param, json });

            if (!response.ok) {
                throw new Error("Failed to update deal");
            }

            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["deals"] });

            const responseData = data.data as unknown as { $id: string; linkedDraftId?: string | null };
            if (responseData.linkedDraftId) {
                toast.success(t("draft-invoice-created"), {
                    description: t("draft-invoice-created-description"),
                    duration: Infinity,
                    closeButton: true,
                    action: {
                        label: t("view-billing"),
                        onClick: () => router.push("/billing-management"),
                    },
                });
            }
        },
        onError: () => {
            toast.error(t("deal-update-error"));
        },
    });
};
