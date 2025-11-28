import { TaskStatus } from "../types";
import React, { useState, useEffect } from "react";
import { CircleCheckIcon, CircleDashedIcon, CircleDotDashed, CircleDotIcon, CircleIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShowCardCountType, STATUS_TO_LABEL_KEY } from "@/app/workspaces/constants/workspace-config-keys";
import { useTaskFilters } from "../hooks/use-task-filters";
import EditableText from "@/components/EditableText";
import { useWorkspaceConfig } from "@/app/workspaces/hooks/use-workspace-config";
import { useWorkspacePermissions } from "@/app/workspaces/hooks/use-workspace-permissions";
import { CustomStatus } from "@/app/workspaces/types/custom-status";
import { useCustomStatuses } from "@/app/workspaces/hooks/use-custom-statuses";
import { useTranslations } from "next-intl";


interface KanbanColumnHeaderProps {
    board: TaskStatus,
    taskCount: number,
    addTask: () => void,
    showCount?: string;
    onUpdateLabel: (status: TaskStatus, label: string) => void;
    customStatus?: CustomStatus;
}

const statusIconMap: Record<TaskStatus, React.ReactNode> = {
    [TaskStatus.BACKLOG]: <CircleDashedIcon className="size-[18px] text-pink-400" />,
    [TaskStatus.TODO]: <CircleIcon className="size-[18px] text-red-400" />,
    [TaskStatus.IN_PROGRESS]: <CircleDotDashed className="size-[18px] text-yellow-400" />,
    [TaskStatus.IN_REVIEW]: <CircleDotIcon className="size-[18px] text-blue-400" />,
    [TaskStatus.DONE]: <CircleCheckIcon className="size-[18px] text-emerald-400" />,
}

const KanbanColumnHeader = ({ board, taskCount, addTask, showCount = ShowCardCountType.ALWAYS, onUpdateLabel, customStatus }: KanbanColumnHeaderProps) => {

    const t = useTranslations('workspaces');
    const config = useWorkspaceConfig();
    const { canCreateTask, canEditLabel } = useWorkspacePermissions();
    const { getIconComponent } = useCustomStatuses();

    const [{ assigneeId, search, dueDate, priority }] = useTaskFilters();

    // Check if any filter is active (excluding status since it's not used in kanban view)
    const hasActiveFilters = !!(assigneeId || search || dueDate || priority);

    // Determine if we should show the count
    const shouldShowCount = showCount === ShowCardCountType.ALWAYS ||
                            (showCount === ShowCardCountType.FILTERED && hasActiveFilters);

    // Get icon - either from custom status or from default map
    let icon: React.ReactNode;
    if (customStatus) {
        const IconComponent = getIconComponent(customStatus.icon);
        icon = <IconComponent className="size-[18px]" style={{ color: customStatus.color }} />;
    } else {
        icon = statusIconMap[board];
    }

    // Get label - either from custom status or from config/default
    let defaultLabel: string;
    let customLabel: string | null = null;

    if (customStatus) {
        defaultLabel = customStatus.label;
    } else {
        const labelKey = STATUS_TO_LABEL_KEY[board];
        customLabel = config[labelKey] as string | null;

        // Usar traducciones en lugar de snakeCaseToTitleCase
        const statusTranslationKey = {
            [TaskStatus.BACKLOG]: 'backlog',
            [TaskStatus.TODO]: 'todo',
            [TaskStatus.IN_PROGRESS]: 'in-progress',
            [TaskStatus.IN_REVIEW]: 'in-review',
            [TaskStatus.DONE]: 'done',
        }[board];

        defaultLabel = statusTranslationKey ? t(statusTranslationKey) : board;
    }

    // Local state for optimistic update
    const [localLabel, setLocalLabel] = useState(customLabel || defaultLabel);

    // Sync local state when config changes
    useEffect(() => {
        setLocalLabel(customLabel || defaultLabel);
    }, [customLabel, defaultLabel]);

    const handleSaveLabel = (newLabel: string) => {
        // Optimistic update
        setLocalLabel(newLabel || defaultLabel);
        // Call parent to persist
        onUpdateLabel(board, newLabel);
    };

    return (
        <div className="px-2 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-x-2 flex-1 min-w-0">
                {icon}
                <div className="w-[100px]">
                    <EditableText
                        value={localLabel}
                        onSave={handleSaveLabel}
                        size="sm"
                        className="px-0 py-0 min-h-0 w-full"
                        displayClassName={`text-sm font-medium truncate ${
                            canEditLabel ? 'hover:bg-muted/80' : 'cursor-default'
                        }`}
                        inputClassName="text-sm font-medium w-full"
                        disabled={!canEditLabel}
                    />
                </div>
                {shouldShowCount && (
                    <div className="size-5 flex items-center justify-center rounded-md bg-neutral-200 text-neutral-700 font-medium">
                        {taskCount}
                    </div>
                )}
            </div>
            {canCreateTask && (
                <Button variant='ghost' size='icon' className="size-5" onClick={addTask}>
                    <PlusIcon className="size-4 text-neutral-500" />
                </Button>
            )}
        </div>
    );
}

export default KanbanColumnHeader;