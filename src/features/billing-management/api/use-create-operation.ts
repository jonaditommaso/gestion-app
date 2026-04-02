import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";
import type { BillingDoc } from "@/lib/demo-data";

type ResponseType = InferResponseType<typeof client.api.billing['$post']>
type RequestType = InferRequestType<typeof client.api.billing['$post']>

export const useCreateOperation = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('billing');
    const { isDemo } = useAppContext();
    const { addBillingOp } = useDemoData();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json}) => {
            if (isDemo) {
                const newOp: BillingDoc = {
                    $id: `demo-bill-${Date.now()}`,
                    $createdAt: new Date().toISOString(),
                    $updatedAt: new Date().toISOString(),
                    $collectionId: 'demo',
                    $databaseId: 'demo',
                    $permissions: [],
                    type: (json.type as BillingDoc['type']) ?? 'income',
                    import: (json.import as number) ?? 0,
                    currency: (json.currency as string) ?? 'USD',
                    category: (json.category as string) ?? '',
                    status: (json.status as BillingDoc['status']) ?? 'PENDING',
                    date: json.date ? new Date(json.date).toISOString() : new Date().toISOString(),
                    partyName: (json.partyName as string | undefined) ?? '',
                    paymentMethod: (json.paymentMethod as string | undefined) ?? undefined,
                    note: (json.note as string | undefined) ?? undefined,
                    teamId: 'demo-team',
                    isArchived: false,
                    isDraft: false,
                };
                addBillingOp(newOp);
                return { success: true } as unknown as ResponseType;
            }

            const response = await client.api.billing['$post']({ json });

            if(!response.ok) {
                throw new Error('Failed to create operation')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('operation-created'))
            queryClient.invalidateQueries({ queryKey: ['billing'] })
        },
        onError: () => {
            toast.error(t('failed-create-operation'))
        }
    })
    return mutation
}