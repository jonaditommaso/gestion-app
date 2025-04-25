import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.pricing['stripe']['$post'], 200>
type RequestType = InferRequestType<typeof client.api.pricing['stripe']['$post']>

export const useStripeCheckout = () => {
    const router = useRouter();

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
                toast.error('No se pudo obtener el link de pago');
                return;
              }
              router.push(url);
        },
        onError: () => {
            toast.error('Lo sentimos, hubo un error redireccionando a Stripe')
        }
    })
    return mutation
}