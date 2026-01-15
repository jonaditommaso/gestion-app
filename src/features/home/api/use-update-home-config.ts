import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api['home-config']['$post'], 200>
type RequestType = InferRequestType<typeof client.api['home-config']['$post']>

interface MutationContext {
    previousConfig: unknown;
}

export const useUpdateHomeConfig = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('home');

    const mutation = useMutation<ResponseType, Error, RequestType, MutationContext>({
        mutationFn: async ({ json }) => {
            const response = await client.api['home-config']['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to update home config')
            }

            return await response.json()
        },
        onMutate: async ({ json }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['home-config'] });

            // Snapshot previous value
            const previousConfig = queryClient.getQueryData(['home-config']);

            // Optimistically update the cache
            queryClient.setQueryData(['home-config'], (old: { widgets?: string } | null) => ({
                ...old,
                widgets: json.widgets
            }));

            return { previousConfig };
        },
        onError: (_err, _variables, context) => {
            // Rollback on error
            if (context?.previousConfig) {
                queryClient.setQueryData(['home-config'], context.previousConfig);
            }
            toast.error(t('failed-save-config'))
        },
        onSuccess: () => {
            toast.success(t('config-saved'))
        },
        onSettled: () => {
            // Refetch after error or success
            queryClient.invalidateQueries({ queryKey: ['home-config'] })
        }
    })
    return mutation
}
