import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";
import type { BillingDoc } from "@/lib/demo-data";

type ResponseType = InferResponseType<typeof client.api.billing[':billingId']['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.billing[':billingId']['$patch']>

export const useUpdateOperation = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('billing');
    const { isDemo } = useAppContext();
    const { updateBillingOp } = useDemoData();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json, param }) => {
            if (isDemo) {
                updateBillingOp(param.billingId, json as Partial<BillingDoc>);
                return { success: true } as unknown as ResponseType;
            }

            const response = await client.api.billing[':billingId']['$patch']({ json, param });

            if (!response.ok) {
                throw new Error('Failed to update operation')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('operation-updated'))
            queryClient.invalidateQueries({ queryKey: ['billing'] })
        },
        onError: () => {
            toast.error(t('failed-update-operation'))
        }
    })

    return mutation
}
