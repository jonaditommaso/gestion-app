import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useUpdateTask } from "./use-update-task";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useCurrent } from "@/features/auth/api/use-current";

export const useArchiveTask = () => {
    const t = useTranslations('workspaces');
    const { mutate: updateTask, isPending } = useUpdateTask();
    const workspaceId = useWorkspaceId();
    const { data: user } = useCurrent();
    const { data: membersData } = useGetMembers({ workspaceId });

    const archiveTask = (taskId: string) => {
        // Find the current user's member ID
        const currentMember = membersData?.documents.find(m => m.userId === user?.$id);

        if (!currentMember) {
            toast.error(t('failed-archive-task'));
            return;
        }

        updateTask(
            {
                json: {
                    archived: true,
                    archivedBy: currentMember.$id,
                    archivedAt: new Date() as any, // Will be converted to ISO string by the API
                },
                param: { taskId }
            },
            {
                onSuccess: () => {
                    toast.success(t('task-archived'));
                },
                onError: () => {
                    toast.error(t('failed-archive-task'));
                }
            }
        );
    };

    return {
        archiveTask,
        isPending
    };
};
