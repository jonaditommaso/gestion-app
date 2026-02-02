import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.landing['contact-us']['$post'], 200>
type RequestType = InferRequestType<typeof client.api.landing['contact-us']['$post']>

export const useContactUs = () => {
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.landing['contact-us']['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to send contact message')
            }

            return await response.json()
        },
    })
    return mutation
}
