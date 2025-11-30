import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/hooks/use-confirm";
import { ExternalLinkIcon, FlagIcon, FlagOffIcon, Share2Icon, TrashIcon } from "lucide-react";
import { useDeleteTask } from "../api/use-delete-task";
import { useUpdateTask } from "../api/use-update-task";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useTranslations } from "next-intl";
import { useWorkspacePermissions } from "@/app/workspaces/hooks/use-workspace-permissions";
import { useState } from "react";
import { ShareTaskModal } from "./ShareTaskModal";
import { Separator } from "@/components/ui/separator";

interface TaskActionsProps {
    id: string,
    children: React.ReactNode,
    isFeatured?: boolean,
    taskName?: string,
    taskType?: string
}

const TaskActions = ({ id, children, isFeatured = false, taskName = '', taskType = 'task' }: TaskActionsProps) => {
    const t = useTranslations('workspaces')
    const { canDeleteTask } = useWorkspacePermissions();
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [ConfirmDialog, confirm] = useConfirm(
        t('delete-task'),
        t('action-cannot-be-undone'),
        'destructive'
    );

    const workspaceId = useWorkspaceId()

    const { mutate: deleteTask, isPending: isDeletingTask } = useDeleteTask();
    const { mutate: updateTask, isPending: isUpdatingTask } = useUpdateTask();

    const onOpenTask = () => {
        window.open(`/workspaces/${workspaceId}/tasks/${id}`, '_blank')
    }

    const onDelete = async () => {
        const ok = await confirm()
        if (!ok) return;

        deleteTask({ param: { taskId: id }})
    }

    // todo: check how to implement optimistic update here with useOptimistic
    const onToggleFeatured = () => {
        updateTask({
            json: { featured: !isFeatured },
            param: { taskId: id }
        })
    }

    return (
        <div className="flex justify-end">
            <ConfirmDialog />
            <ShareTaskModal
                taskId={id}
                taskName={taskName}
                taskType={taskType}
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
            />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                        onClick={onOpenTask}
                        className="font-medium p-[10px]"
                    >
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                        {t('task-details')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setIsShareModalOpen(true)}
                        className="font-medium p-[10px]"
                    >
                        <Share2Icon className="size-4 mr-2 stroke-2" />
                        {t('share-task')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={onToggleFeatured}
                        className="font-medium p-[10px]"
                    >
                        {isFeatured ? (
                            <>
                                <FlagOffIcon className="size-4 mr-2 stroke-2" />
                                {t('unfeature-task')}
                            </>
                        ) : (
                            <>
                                <FlagIcon className="size-4 mr-2 stroke-2" />
                                {t('feature-task')}
                            </>
                        )}
                    </DropdownMenuItem>
                    {canDeleteTask && (
                        <>
                            <Separator />
                            <DropdownMenuItem
                                onClick={onDelete}
                                disabled={isDeletingTask || isUpdatingTask}
                                className="text-amber-700 focus:text-amber-700 font-medium p-[10px]"
                            >
                                <TrashIcon className="size-4 mr-2 stroke-2" />
                                {t('delete-task')}
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default TaskActions;