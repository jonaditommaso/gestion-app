import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAppContext } from "@/context/AppContext";
import { useDemoData } from "@/context/DemoDataContext";
import { TaskStatus } from "../types";
import type { Task } from "../types";

type ResponseType = InferResponseType<typeof client.api.tasks['$post']>
type RequestType = InferRequestType<typeof client.api.tasks['$post']>

export const useCreateTask = () => {
    const queryClient = useQueryClient();
    const t = useTranslations('workspaces');
    const { isDemo } = useAppContext();
    const { addTask } = useDemoData();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            if (isDemo) {
                const newTask: Task = {
                    $id: `demo-task-${Date.now()}`,
                    $createdAt: new Date().toISOString(),
                    $updatedAt: new Date().toISOString(),
                    $collectionId: 'demo',
                    $databaseId: 'demo',
                    $permissions: [],
                    name: json.name,
                    status: (json.status as TaskStatus) ?? TaskStatus.TODO,
                    workspaceId: json.workspaceId,
                    position: Date.now(),
                    dueDate: json.dueDate ? new Date(json.dueDate as unknown as string).toISOString() : '',
                    assignees: [],
                    priority: json.priority ?? 2,
                    type: json.type ?? undefined,
                    parentId: json.parentId ?? undefined,
                };
                addTask(newTask);
                return { success: true } as unknown as ResponseType;
            }

            const response = await client.api.tasks['$post']({ json });

            if(!response.ok) {
                throw new Error('Failed to create task')
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success(t('task-created'))
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
        },
        onError: () => {
            toast.error(t('failed-create-task'))
        }
    })
    return mutation
}