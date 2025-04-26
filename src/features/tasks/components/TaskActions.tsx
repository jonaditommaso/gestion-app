import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/hooks/use-confirm";
import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useDeleteTask } from "../api/use-delete-task";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useTranslations } from "next-intl";

interface TaskActionsProps {
    id: string,
    children: React.ReactNode
}

const TaskActions = ({ id, children }: TaskActionsProps) => {
    const t = useTranslations('workspaces')
    const [ConfirmDialog, confirm] = useConfirm(
        t('delete-task'),
        t('action-cannot-be-undone'),
        'destructive'
    );

    const workspaceId = useWorkspaceId()
    const router = useRouter();

    const onOpenTask = () => {
        router.push(`/workspaces/${workspaceId}/tasks/${id}`)
    }

    const { mutate, isPending } = useDeleteTask();

    const onDelete = async () => {
        const ok = await confirm()
        if (!ok) return;

        mutate({ param: { taskId: id }})
    }

    return (
        <div className="flex justify-end">
            <ConfirmDialog />
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
                        onClick={() => {}}
                        className="font-medium p-[10px]"
                    >
                        <PencilIcon className="size-4 mr-2 stroke-2" />
                        {t('edit-task')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={onDelete}
                        disabled={isPending}
                        className="text-amber-700 focus:text-amber-700 font-medium p-[10px]"
                    >
                        <TrashIcon className="size-4 mr-2 stroke-2" />
                        {t('delete-task')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default TaskActions;