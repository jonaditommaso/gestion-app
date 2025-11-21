import { MoreHorizontalIcon, TextIcon } from "lucide-react";
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
import { WorkspaceConfigKey } from "@/app/workspaces/constants/workspace-config-keys";

interface KanbanCardProps {
    task: Task
}

const KanbanCard = ({ task }: KanbanCardProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const config = useWorkspaceConfig();
    const isCompact = config[WorkspaceConfigKey.COMPACT_CARDS];
    const priorityOption = TASK_PRIORITY_OPTIONS.find(p => p.value === (task.priority || 3))!
    const PriorityIcon = priorityOption.icon
    const typeOption = TASK_TYPE_OPTIONS.find(t => t.value === (task.type || 'task'))!
    const TypeIcon = typeOption.icon

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
                            <div className="size-1 rounded-full bg-neutral-300" />
                            <TaskDate value={task.dueDate} className="text-xs" />
                        </div>
                        <MemberAvatar
                            name={task.assignee.name}
                            fallbackClassName="text-[10px]"
                            />
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