'use client'

import ErrorPage from "@/app/error";
import CustomLoader from "@/components/CustomLoader";
import { useGetTask } from "@/features/tasks/api/use-get-task";
import { useTaskId } from "@/features/tasks/hooks/use-task-id";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontalIcon, TrashIcon } from "lucide-react";
import { useDeleteTask } from "@/features/tasks/api/use-delete-task";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useTranslations } from "next-intl";
import TaskDetailsShared, { TaskTitleEditor } from "@/features/tasks/components/TaskDetailsShared";

const TaskPageActions = ({
    taskId
}: {
    taskId: string;
}) => {
    const t = useTranslations('workspaces');
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();
    const [ConfirmDialog, confirm] = useConfirm(
        t('delete-task'),
        t('action-cannot-be-undone'),
        'destructive'
    );

    const onDelete = async () => {
        const ok = await confirm();
        if (!ok) return;

        deleteTask({ param: { taskId } }, {
            onSuccess: () => {
                router.push(`/workspaces/${workspaceId}/tasks`);
            }
        });
    };

    return (
        <>
            <ConfirmDialog />
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isDeleting}>
                            <MoreHorizontalIcon className="size-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onDelete} className="text-destructive">
                            <TrashIcon className="size-4 mr-2" />
                            {t('delete-task')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
};

const TaskIdClient = () => {
    const taskId = useTaskId();
    const { data, isLoading } = useGetTask({ taskId })

    if (isLoading) return <CustomLoader />

    if (!data) return <ErrorPage />

    return (
        <div className="flex flex-col w-full px-6 py-4">
            <div className="max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <TaskTitleEditor
                        taskId={data.$id}
                        initialTitle={data.name}
                        initialType={data.type}
                        size="page"
                    />
                    <TaskPageActions taskId={data.$id} />
                </div>

                {/* Content */}
                <TaskDetailsShared task={data} />
            </div>
        </div>
    );
}

export default TaskIdClient;