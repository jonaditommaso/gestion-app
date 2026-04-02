import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";
import type { DealWithAssignees } from "@/lib/demo-data";

type ResponseType = InferResponseType<typeof client.api.sells.$post>;
type RequestType = InferRequestType<typeof client.api.sells.$post>;

export const useCreateDeal = () => {
    const queryClient = useQueryClient();
    const t = useTranslations("sales");
    const { isDemo } = useAppContext();
    const { addDeal } = useDemoData();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            if (isDemo) {
                const newDeal: DealWithAssignees = {
                    id: `demo-deal-${Date.now()}`,
                    title: json.title as string,
                    description: (json.description as string | undefined) ?? '',
                    status: (json.status as DealWithAssignees['status']) ?? 'LEADS',
                    assignees: [],
                    amount: (json.amount as number | undefined) ?? 0,
                    currency: (json.currency as DealWithAssignees['currency']) ?? 'USD',
                    contactId: `contact-${Date.now()}`,
                    companyResponsabileName: (json.companyResponsabileName as string | undefined) ?? '',
                    companyResponsabileEmail: (json.companyResponsabileEmail as string | undefined) ?? '',
                    companyResponsabilePhoneNumber: (json.companyResponsabilePhoneNumber as string | undefined) ?? '',
                    company: (json.company as string | undefined) ?? '',
                    expectedCloseDate: (json.expectedCloseDate as string | undefined) ?? null,
                    lastStageChangedAt: new Date().toISOString(),
                    healthScore: 50,
                    needsAttention: false,
                    priority: (json.priority as DealWithAssignees['priority']) ?? 2,
                    nextStep: '',
                    outcome: 'PENDING',
                    activities: [],
                    linkedDraftId: null,
                    labelId: null,
                };
                addDeal(newDeal);
                return { success: true } as unknown as ResponseType;
            }

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
