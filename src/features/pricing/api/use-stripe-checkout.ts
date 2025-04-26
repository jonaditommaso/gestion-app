import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type ResponseType = InferResponseType<typeof client.api.pricing['stripe']['$post'], 200>
type RequestType = InferRequestType<typeof client.api.pricing['stripe']['$post']>

export const useStripeCheckout = () => {
    const router = useRouter();
    const t = useTranslations('pricing');

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.pricing['stripe']['$post']({ json });

            if(!response.ok) {
                throw new Error('Failed to access to Stripe payment')
            }

            return await response.json()
        },
        onSuccess: ({ url }) => {
            if (!url) {
                toast.error(t('cannot-get-payment-link'));
                return;
              }
              router.push(url);
        },
        onError: () => {
            toast.error(t('redirection-stripe-error'))
        }
    })
    return mutation
}