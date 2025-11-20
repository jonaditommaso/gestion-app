import { snakeCaseToTitleCase } from "@/lib/utils";
import { TaskStatus } from "../types";
import React from "react";
import { CircleCheckIcon, CircleDashedIcon, CircleDotDashed, CircleDotIcon, CircleIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShowCardCountType } from "@/app/workspaces/constants/workspace-config-keys";
import { useTaskFilters } from "../hooks/use-task-filters";


interface KanbanColumnHeaderProps {
    board: TaskStatus,
    taskCount: number,
    addTask: () => void,
    showCount?: string;
}

const statusIconMap: Record<TaskStatus, React.ReactNode> = {
    [TaskStatus.BACKLOG]: <CircleDashedIcon className="size-[18px] text-pink-400" />,
    [TaskStatus.TODO]: <CircleIcon className="size-[18px] text-red-400" />,
    [TaskStatus.IN_PROGRESS]: <CircleDotDashed className="size-[18px] text-yellow-400" />,
    [TaskStatus.IN_REVIEW]: <CircleDotIcon className="size-[18px] text-blue-400" />,
    [TaskStatus.DONE]: <CircleCheckIcon className="size-[18px] text-emerald-400" />,
}

const KanbanColumnHeader = ({ board, taskCount, addTask, showCount = ShowCardCountType.ALWAYS }: KanbanColumnHeaderProps) => {

    const icon = statusIconMap[board]

    const [{ assigneeId, search, dueDate, priority }] = useTaskFilters();

    // Check if any filter is active (excluding status since it's not used in kanban view)
    const hasActiveFilters = !!(assigneeId || search || dueDate || priority);

    // Determine if we should show the count
    const shouldShowCount = showCount === ShowCardCountType.ALWAYS ||
                            (showCount === ShowCardCountType.FILTERED && hasActiveFilters);    return (
        <div className="px-2 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-x-2">
                {icon}
                <h2 className="text-sm font-medium">
                    {snakeCaseToTitleCase(board)}
                </h2>
                {shouldShowCount && (
                    <div className="size-5 flex items-center justify-center rounded-md bg-neutral-200 text-neutral-700 font-medium">
                        {taskCount}
                    </div>
                )}
            </div>
            <Button variant='ghost' size='icon' className="size-5" onClick={addTask}>
                <PlusIcon className="size-4 text-neutral-500" />
            </Button>
        </div>
    );
}

export default KanbanColumnHeader;