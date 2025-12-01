'use client'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeleteTask } from "../api/use-delete-task";
import { useConfirm } from "@/hooks/use-confirm";
import { useGetTask } from "../api/use-get-task";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import TaskDetailsContent from "./TaskDetailsContent";
import { useWorkspacePermissions } from "@/app/workspaces/hooks/use-workspace-permissions";

interface TaskDetailsModalProps {
    taskId: string;
    isOpen: boolean;
    onClose: () => void;
}

const TaskDetailsModal = ({ taskId, isOpen, onClose }: TaskDetailsModalProps) => {
    const router = useRouter();
    const { data: task, isLoading } = useGetTask({ taskId });
    const { mutate: deleteTask, isPending: isDeletingTask } = useDeleteTask();
    const { canDeleteTask } = useWorkspacePermissions();
    const [ConfirmDialog, confirm] = useConfirm(
        'Delete task',
        'This action cannot be undone.',
        'destructive'
    );

    const handleDelete = async () => {
        const ok = await confirm();
        if (!ok) return;

        deleteTask(
            { param: { taskId } },
            {
                onSuccess: () => {
                    onClose();
                }
            }
        );
    };

    const handleOpenInNewPage = () => {
        if (!task) return;
        router.push(`/workspaces/${task.workspaceId}/tasks/${task.$id}`);
    };

    return (
        <>
            <ConfirmDialog />
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto [&>button]:hidden">
                    <VisuallyHidden>
                        <DialogTitle>
                            {task?.name || 'Task Details'}
                        </DialogTitle>
                    </VisuallyHidden>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader className="size-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : task ? (
                        <>
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4 pb-4 border-b -mt-2">
                                <TaskDetailsContent.TitleEditor
                                    taskId={task.$id}
                                    initialTitle={task.name}
                                    initialType={task.type}
                                />
                                {canDeleteTask && (
                                    <TaskDetailsContent.Actions
                                        onOpenInNewPage={handleOpenInNewPage}
                                        onDelete={handleDelete}
                                        onClose={onClose}
                                        isDeleting={isDeletingTask}
                                    />
                                )}
                            </div>

                            {/* Content */}
                            <TaskDetailsContent task={task} />
                        </>
                    ) : (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-muted-foreground">Task not found</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default TaskDetailsModal;
