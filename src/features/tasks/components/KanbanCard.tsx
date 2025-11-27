import { MoreHorizontalIcon, TextIcon, Clock } from "lucide-react";
import { Task } from "../types";
import TaskActions from "./TaskActions";
import { Separator } from "@/components/ui/separator";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import TaskDate from "./TaskDate";
import { TASK_PRIORITY_OPTIONS } from "../constants/priority";
import { TASK_TYPE_OPTIONS } from "../constants/type";
import { useState } from "react";
import TaskDetailsModal from "./TaskDetailsModal";
import { cn } from "@/lib/utils";
import { useWorkspaceConfig } from "@/app/workspaces/hooks/use-workspace-config";
import { WorkspaceConfigKey, DateFormatType } from "@/app/workspaces/constants/workspace-config-keys";
import { differenceInDays } from "date-fns";
import { useLocale } from "next-intl";
import '@github/relative-time-element';

interface KanbanCardProps {
    task: Task
}

const KanbanCard = ({ task }: KanbanCardProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const config = useWorkspaceConfig();
    const locale = useLocale();
    const isCompact = config[WorkspaceConfigKey.COMPACT_CARDS];
    const dateFormat = config[WorkspaceConfigKey.DATE_FORMAT];
    const priorityOption = TASK_PRIORITY_OPTIONS.find(p => p.value === (task.priority || 3))!
    const PriorityIcon = priorityOption.icon
    const typeOption = TASK_TYPE_OPTIONS.find(t => t.value === (task.type || 'task'))!
    const TypeIcon = typeOption.icon

    // Calcular color del badge de fecha
    const getDateBadgeColor = () => {
        if (!task.dueDate) return null;
        const today = new Date();
        const endDate = new Date(task.dueDate);
        const diffInDays = differenceInDays(endDate, today);

        if (diffInDays < 0) {
            return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400';
        } else if (diffInDays <= 3) {
            return 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400';
        } else if (diffInDays <= 7) {
            return 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400';
        } else if (diffInDays <= 14) {
            return 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400';
        }
        return 'bg-muted text-muted-foreground';
    };

    return (
        <>
            <TaskDetailsModal
                taskId={task.$id}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
            <div
                className={`p-2.5 mb-1.5 rounded shadow-md space-y-3 cursor-pointer hover:shadow-lg transition ${
                    task.featured ? 'bg-yellow-50/80 dark:bg-yellow-950/20' : 'bg-card'
                }`}
                onClick={() => setIsModalOpen(true)}
            >
            <div>
                <div className="flex items-start justify-between gap-x-2">
                    <p className="text-sm line-clamp-2">{task.name}</p>
                    <div onClick={(e) => e.stopPropagation()}>
                        <TaskActions id={task.$id} isFeatured={task.featured}>
                            <MoreHorizontalIcon className="size-[18px] stroke-1 shrink-0 text-neutral-700 hover:opacity-75 transition" />
                        </TaskActions>
                    </div>
                </div>
                <div className="flex items-start justify-between gap-x-2">
                    <div>
                        {task.description && <TextIcon className="size-4 text-neutral-500" />}
                    </div>
                    <PriorityIcon
                        className="size-4"
                        style={{ color: priorityOption.color }}
                    />
                </div>
                {task.label && (
                    <div className="flex justify-end mt-2">
                        <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {task.label}
                        </span>
                    </div>
                )}
            </div>
            {!isCompact && (
                <>
                    <Separator />
                    <div className="flex items-center justify-between gap-x-1.5">
                        <div className="flex items-center gap-x-1.5">
                            <TypeIcon className={cn("size-4", typeOption.textColor)} />
                            {task.dueDate && (
                                <>
                                    <div className="size-1 rounded-full bg-neutral-300" />
                                    {dateFormat === DateFormatType.LONG
                                        ? <TaskDate value={task.dueDate} className="text-xs" />
                                        : (
                                            <div className="flex justify-end">
                                                <div className={cn(
                                                    "px-2 py-0.5 text-xs font-medium rounded-md flex items-center gap-1",
                                                    getDateBadgeColor()
                                                )}>
                                                    <Clock className="size-3" />
                                                    <relative-time lang={locale} datetime={task.dueDate} />
                                                </div>
                                            </div>
                                        )
                                    }
                                </>
                            )}
                        </div>
                        {task.assignees && task.assignees.length > 0 && (
                            <div className="flex items-center">
                                <MemberAvatar
                                    name={task.assignees[0].name}
                                    fallbackClassName="text-[10px]"
                                />
                                {task.assignees.length > 1 && (
                                    <span className="ml-1 text-[10px] text-muted-foreground">+{task.assignees.length - 1}</span>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
            {/* <div>
                <p className="text-xs text-muted-foreground m-0">JON-672</p>
            </div> */}
        </div>
        </>
    );
}

export default KanbanCard;