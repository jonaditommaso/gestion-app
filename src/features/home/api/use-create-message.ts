import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";
import type { Message } from "@/features/home/components/messages/types";
import { DEMO_TEAM_MEM_YOU_ID } from "@/lib/demo-data";

type ResponseType = InferResponseType<typeof client.api.messages['$post'], 200>
type RequestType = InferRequestType<typeof client.api.messages['$post']>

export const useCreateMessage = () => {
    const router = useRouter()
    const queryClient = useQueryClient();
    const t = useTranslations('home');
    const { isDemo } = useAppContext();
    const { addMessage } = useDemoData();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            if (isDemo) {
                const toIds = Array.isArray(json.toTeamMemberIds)
                    ? json.toTeamMemberIds as string[]
                    : [json.toTeamMemberIds as string];

                for (const toId of toIds) {
                    const msg: Message = {
                        $id: `demo-msg-sent-${Date.now()}-${toId}`,
                        $createdAt: new Date().toISOString(),
                        $updatedAt: new Date().toISOString(),
                        $collectionId: 'demo',
                        $databaseId: 'demo',
                        $permissions: [],
                        subject: json.subject as string | undefined,
                        content: json.content as string,
                        fromTeamMemberId: DEMO_TEAM_MEM_YOU_ID,
                        toTeamMemberId: toId,
                        teamId: 'demo-team-id',
                        read: false,
                    };
                    addMessage(msg);
                }
                return { success: true } as unknown as ResponseType;
            }

            const response = await client.api.messages['$post']({ json });

            if (!response.ok) {
                throw new Error('Failed to create message')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('messages-created'))
            if (!isDemo) router.refresh();
            queryClient.invalidateQueries({ queryKey: ['messages'] })
        },
        onError: () => {
            toast.error(t('failed-create-message'))
        }
    })
    return mutation
}