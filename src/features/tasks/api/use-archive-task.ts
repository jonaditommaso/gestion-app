import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useUpdateTask } from "./use-update-task";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useCurrent } from "@/features/auth/api/use-current";
import { useQueryClient } from "@tanstack/react-query";

export const useArchiveTask = () => {
    const t = useTranslations('workspaces');
    const { mutate: updateTask, isPending } = useUpdateTask();
    const workspaceId = useWorkspaceId();
    const { data: user } = useCurrent();
    const { data: membersData } = useGetMembers({ workspaceId });
    const queryClient = useQueryClient();

    const archiveTask = (taskId: string, onSuccess?: () => void) => {
        // Validación: asegurarse de que los datos necesarios están disponibles
        if (!user || !membersData) {
            console.warn('Cannot archive task: user or members data not available', { user: !!user, membersData: !!membersData });
            return;
        }

        // Find the current user's member ID
        const currentMember = membersData.documents.find(m => m.userId === user.$id);

        if (!currentMember) {
            console.warn('Cannot archive task: currentMember not found', { userId: user.$id, members: membersData.documents.map(m => m.userId) });
            toast.error(t('failed-archive-task'));
            return;
        }

        console.log('Archiving task:', { taskId, archivedBy: currentMember.$id });

        updateTask(
            {
                json: {
                    archived: true,
                    archivedBy: currentMember.$id,
                    archivedAt: new Date(),
                },
                param: { taskId }
            },
            {
                onSuccess: () => {
                    console.log('Task archived successfully');
                    toast.success(t('task-archived'));
                    // Invalida inmediatamente todas las queries relacionadas
                    queryClient.invalidateQueries({ queryKey: ['tasks'] });
                    queryClient.invalidateQueries({ queryKey: ['subtasks'] });
                    // Ejecutar callback adicional si existe
                    onSuccess?.();
                    queryClient.invalidateQueries({ queryKey: ['archived-tasks'] });
                },
                onError: (error) => {
                    console.error('Error archiving task:', error);
                    // No mostrar toast aquí, use-update-task ya lo hace
                }
            }
        );
    };

    return {
        archiveTask,
        isPending
    };
};
