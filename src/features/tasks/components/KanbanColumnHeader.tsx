import { TaskStatus } from "../types";
import React, { useState, useEffect } from "react";
import { CircleCheckIcon, CircleDashedIcon, CircleDotDashed, CircleDotIcon, CircleIcon, MoreHorizontalIcon, PencilIcon, PlusIcon, ArrowRightIcon, TrashIcon, ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShowCardCountType, STATUS_TO_LABEL_KEY } from "@/app/workspaces/constants/workspace-config-keys";
import { useTaskFilters } from "../hooks/use-task-filters";
import EditableText from "@/components/EditableText";
import { useWorkspaceConfig } from "@/app/workspaces/hooks/use-workspace-config";
import { useWorkspacePermissions } from "@/app/workspaces/hooks/use-workspace-permissions";
import { CustomStatus } from "@/app/workspaces/types/custom-status";
import { useCustomStatuses } from "@/app/workspaces/hooks/use-custom-statuses";
import { useTranslations } from "next-intl";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface KanbanColumnHeaderProps {
    board: TaskStatus,
    taskCount: number,
    addTask: () => void,
    showCount?: string;
    onUpdateLabel: (status: TaskStatus, label: string) => void;
    /** Custom status info (for non-default columns) - deprecated, use statusInfo instead */
    customStatus?: CustomStatus;
    /** Full status info including overrides for default columns */
    statusInfo?: CustomStatus;
    onEditColumn?: () => void;
    onMoveAllCards?: (targetStatusId: string) => void;
    onDeleteColumn?: () => void;
    /** All available statuses for move cards menu */
    availableStatuses?: CustomStatus[];
    /** Whether the column has reached its rigid limit */
    isRigidLimitReached?: boolean;
}

const statusIconMap: Record<TaskStatus, React.ReactNode> = {
    [TaskStatus.BACKLOG]: <CircleDashedIcon className="size-[18px] text-pink-400" />,
    [TaskStatus.TODO]: <CircleIcon className="size-[18px] text-red-400" />,
    [TaskStatus.IN_PROGRESS]: <CircleDotDashed className="size-[18px] text-yellow-400" />,
    [TaskStatus.IN_REVIEW]: <CircleDotIcon className="size-[18px] text-blue-400" />,
    [TaskStatus.DONE]: <CircleCheckIcon className="size-[18px] text-emerald-400" />,
    [TaskStatus.CUSTOM]: <CircleDashedIcon className="size-[18px] text-gray-400" />, // Fallback, custom statuses use their own icon
}

const KanbanColumnHeader = ({ board, taskCount, addTask, showCount = ShowCardCountType.ALWAYS, onUpdateLabel, customStatus, statusInfo, onEditColumn, onMoveAllCards, onDeleteColumn, availableStatuses = [], isRigidLimitReached = false }: KanbanColumnHeaderProps) => {

    const t = useTranslations('workspaces');
    const config = useWorkspaceConfig();
    const { canCreateTask, canEditLabel } = useWorkspacePermissions();
    const { getIconComponent } = useCustomStatuses();

    const [{ assigneeId, search, dueDate, priority }] = useTaskFilters();

    // State for dropdown menu view (main or move cards)
    const [menuView, setMenuView] = useState<'main' | 'move'>('main');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Check if any filter is active (excluding status since it's not used in kanban view)
    const hasActiveFilters = !!(assigneeId || search || dueDate || priority);

    // Determine if we should show the count
    const shouldShowCount = showCount === ShowCardCountType.ALWAYS ||
                            (showCount === ShowCardCountType.FILTERED && hasActiveFilters);

    // Use statusInfo if provided, otherwise fall back to customStatus or defaults
    const effectiveStatus = statusInfo || customStatus;

    // Get icon - from statusInfo/customStatus or from default map
    let icon: React.ReactNode;
    if (effectiveStatus) {
        const IconComponent = getIconComponent(effectiveStatus.icon);
        icon = <IconComponent className="size-[18px]" style={{ color: effectiveStatus.color }} />;
    } else {
        icon = statusIconMap[board];
    }

    // Translation keys for default statuses
    const statusTranslationKey: Record<string, string> = {
        [TaskStatus.BACKLOG]: 'backlog',
        [TaskStatus.TODO]: 'todo',
        [TaskStatus.IN_PROGRESS]: 'in-progress',
        [TaskStatus.IN_REVIEW]: 'in-review',
        [TaskStatus.DONE]: 'done',
    };

    // Get label - from statusInfo/customStatus or from config/default
    let defaultLabel: string;
    let customLabel: string | null = null;

    if (effectiveStatus) {
        // For default statuses, check if there's an override in metadata
        // If not, use translation instead of hardcoded English label
        if (effectiveStatus.isDefault) {
            const labelKey = STATUS_TO_LABEL_KEY[board];
            customLabel = config[labelKey] as string | null;
            // Use translation for default status
            defaultLabel = statusTranslationKey[board] ? t(statusTranslationKey[board]) : effectiveStatus.label;
        } else {
            // For custom statuses, use the stored label
            defaultLabel = effectiveStatus.label;
        }
    } else {
        const labelKey = STATUS_TO_LABEL_KEY[board];
        customLabel = config[labelKey] as string | null;
        defaultLabel = statusTranslationKey[board] ? t(statusTranslationKey[board]) : board;
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
                <div className="flex-1 min-w-0">
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
            </div>
            <div className="flex items-center gap-x-1">
                {shouldShowCount && (
                    <div className="size-5 flex items-center justify-center rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-medium">
                        {taskCount}
                    </div>
                )}
                <DropdownMenu open={isDropdownOpen} onOpenChange={(open) => {
                    setIsDropdownOpen(open);
                    if (!open) {
                        // Reset to main view when closing
                        setTimeout(() => setMenuView('main'), 150);
                    }
                }}>
                    <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon' className="size-5">
                            <MoreHorizontalIcon className="size-4 text-neutral-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-fit min-w-[180px]">
                        {menuView === 'main' ? (
                            <>
                                <DropdownMenuItem onClick={onEditColumn} className="cursor-pointer">
                                    <PencilIcon className="size-4 mr-2" />
                                    {t('edit-column')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setMenuView('move');
                                    }}
                                    disabled={taskCount === 0}
                                    className="cursor-pointer whitespace-nowrap"
                                >
                                    <ArrowRightIcon className="size-4 mr-2" />
                                    {t('move-all-cards')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={onDeleteColumn}
                                    className="text-destructive focus:text-destructive cursor-pointer"
                                >
                                    <TrashIcon className="size-4 mr-2" />
                                    {t('delete-column')}
                                </DropdownMenuItem>
                            </>
                        ) : (
                            <>
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setMenuView('main');
                                    }}
                                    className="cursor-pointer"
                                >
                                    <ArrowLeftIcon className="size-4 mr-2" />
                                    {t('back')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                    {t('select-destination')}
                                </div>
                                {availableStatuses
                                    .filter(status => status.id !== board)
                                    .map(status => {
                                        const IconComponent = getIconComponent(status.icon);
                                        // Get translated label for default statuses
                                        const statusLabel = status.isDefault && statusTranslationKey[status.id]
                                            ? t(statusTranslationKey[status.id])
                                            : status.label;
                                        return (
                                            <DropdownMenuItem
                                                key={status.id}
                                                onClick={() => {
                                                    onMoveAllCards?.(status.id);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="cursor-pointer"
                                            >
                                                <IconComponent className="size-4 mr-2" style={{ color: status.color }} />
                                                {statusLabel}
                                            </DropdownMenuItem>
                                        );
                                    })}
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
                {canCreateTask && !isRigidLimitReached && (
                    <Button variant='ghost' size='icon' className="size-5" onClick={addTask}>
                        <PlusIcon className="size-4 text-neutral-500" />
                    </Button>
                )}
            </div>
        </div>
    );
}

export default KanbanColumnHeader;