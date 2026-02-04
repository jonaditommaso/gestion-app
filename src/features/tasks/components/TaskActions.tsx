import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { ExternalLinkIcon, FlagIcon, FlagOffIcon, MoreHorizontalIcon, Share2Icon, TrashIcon, XIcon, CopyIcon, ArchiveIcon } from "lucide-react";
import { useDeleteTask } from "../api/use-delete-task";
import { useUpdateTask } from "../api/use-update-task";
import { useDuplicateTask } from "../api/use-duplicate-task";
import { useArchiveTask } from "../api/use-archive-task";
import { useGetTask } from "../api/use-get-task";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ShareTaskModal } from "./ShareTaskModal";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

export type TaskActionsVariant = 'kanban' | 'modal' | 'page';

interface TaskActionsProps {
    taskId: string;
    taskName: string;
    taskType?: string;
    isFeatured?: boolean;
    /**
     * - 'kanban': Para KanbanCard y DataTable. Muestra "Abrir detalles" (nueva pestaña)
     * - 'modal': Para TaskDetailsModal. Muestra "Abrir en nueva página" + botón cerrar
     * - 'page': Para página de tarea. Sin opciones de navegación
     */
    variant?: TaskActionsVariant;
    /** Solo para variant='modal' - callback para cerrar el modal */
    onClose?: () => void;
    /** Contenido personalizado para el trigger (solo kanban) */
    children?: React.ReactNode;
}

const TaskActions = ({
    taskId,
    taskName,
    taskType = 'task',
    isFeatured = false,
    variant = 'kanban',
    onClose,
    children
}: TaskActionsProps) => {
    const t = useTranslations('workspaces');
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const { mutate: deleteTask, isPending: isDeletingTask } = useDeleteTask();
    const { mutate: updateTask, isPending: isUpdatingTask } = useUpdateTask();
    const { mutate: duplicateTask, isPending: isDuplicatingTask } = useDuplicateTask();
    const { archiveTask, isPending: isArchivingTask } = useArchiveTask();
    const { data: taskData } = useGetTask({ taskId });

    const [ConfirmDeleteDialog, confirmDelete] = useConfirm(
        t('delete-task'),
        t('action-cannot-be-undone'),
        'destructive'
    );

    const [ConfirmArchiveDialog, confirmArchive] = useConfirm(
        t('archive-task-confirm'),
        t('archive-task-confirm-message'),
        'default'
    );

    const isPending = isDeletingTask || isUpdatingTask || isDuplicatingTask || isArchivingTask;
    const isEpic = taskType === 'epic';

    const onOpenInNewTab = () => {
        window.open(`/workspaces/${workspaceId}/tasks/${taskId}`, '_blank');
    };

    const onOpenInNewPage = () => {
        router.push(`/workspaces/${workspaceId}/tasks/${taskId}`);
    };

    const onDelete = async () => {
        const ok = await confirmDelete();
        if (!ok) return;

        deleteTask(
            { param: { taskId } },
            {
                onSuccess: () => {
                    if (variant === 'modal' && onClose) {
                        onClose();
                    } else if (variant === 'page') {
                        router.push(`/workspaces/${workspaceId}/tasks`);
                    }
                }
            }
        );
    };

    const onToggleFeatured = () => {
        updateTask({
            json: { featured: !isFeatured },
            param: { taskId }
        });
    };

    const onDuplicate = () => {
        if (!taskData) return;
        duplicateTask({ task: taskData });
    };

    const onArchive = async () => {
        const ok = await confirmArchive();
        if (!ok) return;

        archiveTask(taskId, () => {
            // Cerrar modal o redirigir según el contexto
            if (variant === 'modal' && onClose) {
                onClose();
            } else if (variant === 'page') {
                router.push(`/workspaces/${workspaceId}`);
            }
        });
    };

    const triggerButton = children || (
        <Button variant="ghost" size="icon" disabled={isPending}>
            <MoreHorizontalIcon className="size-5" />
        </Button>
    );

    return (
        <div className={variant === 'kanban' ? "flex justify-end" : "flex items-center gap-2"}>
            <ConfirmDeleteDialog />
            <ConfirmArchiveDialog />
            <ShareTaskModal
                taskId={taskId}
                taskName={taskName}
                taskType={taskType}
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
            />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    {triggerButton}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    {/* Opción de navegación según variante */}
                    {variant === 'kanban' && (
                        <DropdownMenuItem
                            onClick={onOpenInNewTab}
                            className="font-medium p-[10px] cursor-pointer"
                        >
                            <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                            {t('task-details')}
                        </DropdownMenuItem>
                    )}
                    {variant === 'modal' && (
                        <DropdownMenuItem
                            onClick={onOpenInNewPage}
                            className="font-medium p-[10px] cursor-pointer"
                        >
                            <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                            {t('open-in-new-page')}
                        </DropdownMenuItem>
                    )}

                    {/* Opciones comunes */}
                    <DropdownMenuItem
                        onClick={() => setIsShareModalOpen(true)}
                        className="font-medium p-[10px] cursor-pointer"
                    >
                        <Share2Icon className="size-4 mr-2 stroke-2" />
                        {t('share-task')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={onToggleFeatured}
                        className="font-medium p-[10px] cursor-pointer"
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
                    {!isEpic && (
                        <DropdownMenuItem
                            onClick={onDuplicate}
                            disabled={isPending || !taskData}
                            className="font-medium p-[10px] cursor-pointer"
                        >
                            <CopyIcon className="size-4 mr-2 stroke-2" />
                            {t('duplicate-task')}
                        </DropdownMenuItem>
                    )}

                    <Separator />
                    <DropdownMenuItem
                        onClick={onArchive}
                        disabled={isPending}
                        className="font-medium p-[10px] cursor-pointer"
                    >
                        <ArchiveIcon className="size-4 mr-2 stroke-2" />
                        {t('archive-task')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={onDelete}
                        disabled={isPending}
                        className="text-amber-700 focus:text-amber-700 font-medium p-[10px] cursor-pointer"
                    >
                        <TrashIcon className="size-4 mr-2 stroke-2" />
                        {t('delete-task')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Botón de cerrar solo para modal */}
            {variant === 'modal' && onClose && (
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <XIcon className="size-5" />
                </Button>
            )}
        </div>
    );
};

export default TaskActions;