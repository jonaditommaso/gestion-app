'use client'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader } from "lucide-react";
import { useGetTask } from "../api/use-get-task";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import TaskDetailsContent from "./TaskDetailsContent";
import TaskActions from "./TaskActions";
import { useCurrentUserPermissions } from "@/features/roles/hooks/useCurrentUserPermissions";
import { PERMISSIONS } from "@/features/roles/constants";

interface TaskDetailsModalProps {
    taskId: string;
    isOpen: boolean;
    onClose: () => void;
}

const TaskDetailsModal = ({ taskId, isOpen, onClose }: TaskDetailsModalProps) => {
    const { data: task, isLoading } = useGetTask({ taskId });
    const { hasPermission } = useCurrentUserPermissions();
    const canWrite = hasPermission(PERMISSIONS.WRITE);

    return (
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
                                readOnly={!canWrite}
                            />
                            <TaskActions
                                taskId={task.$id}
                                taskName={task.name}
                                taskType={task.type}
                                isFeatured={task.featured}
                                variant="modal"
                                onClose={onClose}
                            />
                        </div>

                        {/* Content */}
                        <TaskDetailsContent task={task} variant="modal" onClose={onClose} canWrite={canWrite} />
                    </>
                ) : (
                    <div className="flex items-center justify-center py-20">
                        <p className="text-muted-foreground">Task not found</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default TaskDetailsModal;
