'use client';

import { Task } from '../../types';
import { useTranslations, useLocale } from 'next-intl';
import { useWorkspaceId } from '@/app/workspaces/hooks/use-workspace-id';

import { cn } from '@/lib/utils';
import { CircleCheckBig, MoreHorizontal, ExternalLink, Trash2, Calendar as CalendarIcon, Users, Clock, FlagIcon, FlagOffIcon, CopyIcon, Share2Icon, ArchiveIcon } from 'lucide-react';
import { TASK_PRIORITY_OPTIONS } from '../../constants/priority';
import { useCustomLabels } from '@/app/workspaces/hooks/use-custom-labels';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import MemberAvatar from '@/features/members/components/MemberAvatar';
import { useState, useEffect, useRef } from 'react';
import { useUpdateTask } from '../../api/use-update-task';
import { useAssignTask } from '../../api/use-assign-task';
import { useUnassignTask } from '../../api/use-unassign-task';
import { useDuplicateTask } from '../../api/use-duplicate-task';
import { ShareTaskModal } from '../ShareTaskModal';
import { motion, AnimatePresence } from 'motion/react';
import { format, differenceInDays } from 'date-fns';
import { es, enUS, it } from 'date-fns/locale';
import type { Locale as DateLocale } from 'date-fns';

interface EpicSubtaskRowProps {
    subtask: Task;
    onDelete: (subtaskId: string) => void;
    onArchive: (subtaskId: string) => void;
    isOptimistic?: boolean;
    onNavigate?: (subtaskId: string) => void;
    availableMembers?: { $id: string; name: string }[];
    onCompletionUpdate?: (isUpdating: boolean) => void;
}

const localeMap: Record<string, DateLocale> = {
    es,
    en: enUS,
    it,
};

const getDueDateColor = (dueDate: string, completed: boolean) => {
    if (completed) return "text-muted-foreground";

    const today = new Date();
    const endDate = new Date(dueDate);
    const diffInDays = differenceInDays(endDate, today);

    if (diffInDays < 0) {
        return 'text-red-700 dark:text-red-400';
    } else if (diffInDays <= 3) {
        return 'text-red-600 dark:text-red-400';
    } else if (diffInDays <= 7) {
        return 'text-orange-600 dark:text-orange-400';
    }
    return 'text-muted-foreground';
};

export const EpicSubtaskRow = ({
    subtask,
    onDelete,
    onArchive,
    isOptimistic = false,
    onNavigate,
    availableMembers = [],
    onCompletionUpdate,
}: EpicSubtaskRowProps) => {
    const t = useTranslations('workspaces');
    const locale = useLocale();
    const dateLocale = localeMap[locale] || enUS;
    const workspaceId = useWorkspaceId();
    const { getLabelById, getLabelColor } = useCustomLabels();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showPriorityMenu, setShowPriorityMenu] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showAssignees, setShowAssignees] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [optimisticCompleted, setOptimisticCompleted] = useState<boolean | null>(null);
    const prevCompletedAt = useRef(subtask.completedAt);
    const { mutate: updateTask } = useUpdateTask();
    const { mutate: assignTask } = useAssignTask();
    const { mutate: unassignTask } = useUnassignTask();
    const { mutate: duplicateTask } = useDuplicateTask();
    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Get priority icon and color
    const priorityOption = TASK_PRIORITY_OPTIONS.find(p => p.value === (subtask.priority || 3));
    const PriorityIcon = priorityOption?.icon;

    // Get label data
    const customLabel = subtask.label?.startsWith('LABEL_') ? getLabelById(subtask.label) : null;
    const labelColorData = customLabel ? getLabelColor(customLabel.color) : null;

    // Use optimistic state if available
    const isCompleted = optimisticCompleted !== null ? optimisticCompleted : !!subtask.completedAt;

    // Reset optimistic state when server value changes
    useEffect(() => {
        if (subtask.completedAt !== prevCompletedAt.current) {
            prevCompletedAt.current = subtask.completedAt;
            setOptimisticCompleted(null);

            // Clear any pending timeout and notify parent that update is complete
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
                updateTimeoutRef.current = null;
            }
            onCompletionUpdate?.(false);
        }
    }, [subtask.completedAt, onCompletionUpdate]);

    const handleToggleComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isOptimistic) return;

        const newCompletedState = !isCompleted;
        setOptimisticCompleted(newCompletedState);

        const newCompletedAt = newCompletedState ? new Date().toISOString() : null;

        // Notify parent that we're starting the completion update
        onCompletionUpdate?.(true);

        // Clear any existing timeout
        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }

        // Set a safety timeout to hide loading after 5 seconds if data doesn't update
        updateTimeoutRef.current = setTimeout(() => {
            onCompletionUpdate?.(false);
            updateTimeoutRef.current = null;
        }, 5000);

        updateTask({
            json: { completedAt: newCompletedAt as unknown as Date },
            param: { taskId: subtask.$id }
        });
    };

    const handleDelete = () => {
        setShowDropdown(false);
        onDelete(subtask.$id);
    };

    const handleOpenInNewTab = () => {
        window.open(`/workspaces/${workspaceId}/tasks/${subtask.$id}`, '_blank');
        setShowDropdown(false);
    };

    const handleToggleFeatured = () => {
        if (isOptimistic) return;
        updateTask({
            json: { featured: !subtask.featured },
            param: { taskId: subtask.$id }
        });
        setShowDropdown(false);
    };

    const handleDuplicate = () => {
        if (isOptimistic) return;
        duplicateTask({ task: subtask });
        setShowDropdown(false);
    };

    const handleShare = () => {
        setIsShareModalOpen(true);
        setShowDropdown(false);
    };

    const handleArchive = () => {
        if (isOptimistic) return;
        setShowDropdown(false);
        onArchive(subtask.$id);
    };

    const handleRowClick = () => {
        if (onNavigate && !isOptimistic) {
            onNavigate(subtask.$id);
        }
    };

    const handlePriorityChange = (priority: number) => {
        if (isOptimistic) return;
        updateTask({
            json: { priority },
            param: { taskId: subtask.$id }
        });
        setShowPriorityMenu(false);
    };

    const handleDateChange = (date: Date | undefined) => {
        if (isOptimistic) return;
        updateTask({
            json: { dueDate: date || null },
            param: { taskId: subtask.$id }
        });
        setShowDatePicker(false);
    };

    const handleAssigneeToggle = (memberId: string) => {
        if (isOptimistic) return;
        const isAssigned = subtask.assignees?.some(a => a.$id === memberId);

        if (isAssigned) {
            unassignTask({
                param: { taskId: subtask.$id, workspaceMemberId: memberId }
            });
        } else {
            assignTask({
                param: { taskId: subtask.$id },
                json: { workspaceMemberId: memberId }
            });
        }
    };

    // Keep hover state visible when any popover/dropdown is open
    const isInteracting = showDatePicker || showAssignees || showDropdown || showPriorityMenu || isShareModalOpen;

    return (
        <>
            <ShareTaskModal
                taskId={subtask.$id}
                taskName={subtask.name}
                taskType={subtask.type}
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
            />
            <div
                className={cn(
                    "group flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
                    subtask.featured && "bg-yellow-50/80 dark:bg-yellow-950/20 hover:bg-yellow-50 dark:hover:bg-yellow-950/30",
                    isCompleted && "opacity-60",
                    isOptimistic && "opacity-50 cursor-default",
                    isInteracting && !subtask.featured && "bg-muted/50"
                )}
                onClick={handleRowClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Completed checkbox with animation */}
                <AnimatePresence mode="wait">
                    {(isHovered || isCompleted || isInteracting) && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "auto", opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            onClick={handleToggleComplete}
                            className={cn(
                                "flex-shrink-0 cursor-pointer",
                                isOptimistic && "cursor-default"
                            )}
                        >
                            <CircleCheckBig
                                className={cn(
                                    "size-4 transition-colors",
                                    isCompleted
                                        ? "text-green-600 dark:text-green-400 fill-green-100 dark:fill-green-950/30"
                                        : "text-neutral-400 hover:text-green-600 dark:hover:text-green-400"
                                )}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Task name */}
                <motion.span
                    layout
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className={cn(
                        "flex-1 text-sm truncate",
                        isCompleted && "line-through text-muted-foreground"
                    )}
                >
                    {subtask.name}
                </motion.span>

                {/* Assignees - visible when there are assignees, clickable to edit */}
                {subtask.assignees && subtask.assignees.length > 0 && !isOptimistic && (
                    <Popover open={showAssignees} onOpenChange={setShowAssignees}>
                        <PopoverTrigger asChild>
                            <button
                                className="flex -space-x-1 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {subtask.assignees.slice(0, 3).map(assignee => (
                                    <MemberAvatar
                                        key={assignee.$id}
                                        name={assignee.name || '?'}
                                        memberId={assignee.$id}
                                        className="size-6 border-2 border-background"
                                    />
                                ))}
                                {subtask.assignees.length > 3 && (
                                    <div className="size-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                                        +{subtask.assignees.length - 3}
                                    </div>
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2" align="end" onClick={(e) => e.stopPropagation()}>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground px-2">
                                    {t('assignees')}
                                </p>
                                {availableMembers.map(member => {
                                    const isAssigned = subtask.assignees?.some(a => a.$id === member.$id);
                                    return (
                                        <div
                                            key={member.$id}
                                            className={cn(
                                                "flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer",
                                                isAssigned && "bg-muted/50"
                                            )}
                                            onClick={() => handleAssigneeToggle(member.$id)}
                                        >
                                            <MemberAvatar
                                                name={member.name}
                                                memberId={member.$id}
                                                className="size-6"
                                            />
                                            <span className="text-sm truncate">
                                                {member.name}
                                            </span>
                                            {isAssigned && (
                                                <span className="ml-auto text-xs text-primary">✓</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </PopoverContent>
                    </Popover>
                )}

                {/* Due date - visible on hover when set, clickable to edit */}
                {subtask.dueDate && !isOptimistic && (
                    <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                        <PopoverTrigger asChild>
                            <button
                                className={cn(
                                    "flex items-center gap-1 text-xs px-1.5 py-1 rounded hover:bg-muted transition-all cursor-pointer",
                                    getDueDateColor(subtask.dueDate, isCompleted),
                                    (isHovered || isInteracting) ? "opacity-100" : "opacity-0"
                                )}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Clock className={cn("size-3", getDueDateColor(subtask.dueDate, isCompleted))} />
                                <span className={cn("whitespace-nowrap", getDueDateColor(subtask.dueDate, isCompleted))}>
                                    {format(new Date(subtask.dueDate), 'MMM d', { locale: dateLocale })}
                                </span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end" onClick={(e) => e.stopPropagation()}>
                            <CalendarComponent
                                mode="single"
                                selected={new Date(subtask.dueDate)}
                                onSelect={handleDateChange}
                                initialFocus
                                locale={dateLocale}
                            />
                        </PopoverContent>
                    </Popover>
                )}

                {/* Priority icon - clickable with dropdown */}
                {PriorityIcon && !isOptimistic && (
                    <DropdownMenu modal={false} open={showPriorityMenu} onOpenChange={setShowPriorityMenu}>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={cn(
                                    "p-1 rounded hover:bg-muted transition-all flex-shrink-0",
                                    (isHovered || isInteracting) ? "opacity-100" : "opacity-0"
                                )}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <PriorityIcon
                                    className="size-3.5"
                                    style={{ color: priorityOption?.color }}
                                />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            {TASK_PRIORITY_OPTIONS.map(priority => {
                                const Icon = priority.icon;
                                return (
                                    <DropdownMenuItem
                                        key={priority.value}
                                        onClick={() => handlePriorityChange(priority.value)}
                                        className="cursor-pointer"
                                    >
                                        <Icon className="size-4 mr-2" style={{ color: priority.color }} />
                                        {t(priority.translationKey)}
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {/* Label badge */}
                {customLabel && (
                    <span
                        className={cn(
                            "px-1.5 py-0.5 text-[10px] font-medium rounded flex-shrink-0 transition-opacity",
                            (isHovered || isInteracting) ? "opacity-100" : "opacity-0"
                        )}
                        style={{
                            backgroundColor: customLabel.color,
                            color: labelColorData?.textColor || '#000'
                        }}
                    >
                        {customLabel.name}
                    </span>
                )}

                {/* Legacy label badge */}
                {subtask.label && !subtask.label.startsWith('LABEL_') && (
                    <span className={cn(
                        "px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 flex-shrink-0 transition-opacity",
                        (isHovered || isInteracting) ? "opacity-100" : "opacity-0"
                    )}>
                        {subtask.label}
                    </span>
                )}

                {/* Action buttons - show on hover */}
                {!isOptimistic && (
                    <div
                        className={cn(
                            "flex items-center gap-1 transition-opacity",
                            (isHovered || isInteracting) ? "opacity-100" : "opacity-0"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Assignees button - only show when no assignees */}
                        {(!subtask.assignees || subtask.assignees.length === 0) && availableMembers.length > 0 && (
                            <Popover open={showAssignees} onOpenChange={setShowAssignees}>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="size-7">
                                        <Users className="size-3.5" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-56 p-2" align="end" onClick={(e) => e.stopPropagation()}>
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground px-2">
                                            {t('add-assignee')}
                                        </p>
                                        {availableMembers.map(member => (
                                            <div
                                                key={member.$id}
                                                className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer"
                                                onClick={() => handleAssigneeToggle(member.$id)}
                                            >
                                                <MemberAvatar
                                                    name={member.name}
                                                    memberId={member.$id}
                                                    className="size-6"
                                                />
                                                <span className="text-sm truncate">
                                                    {member.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}

                        {/* Date picker - only show when no date is set */}
                        {!subtask.dueDate && (
                            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="size-7">
                                        <CalendarIcon className="size-3.5" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end" onClick={(e) => e.stopPropagation()}>
                                    <CalendarComponent
                                        mode="single"
                                        selected={undefined}
                                        onSelect={handleDateChange}
                                        initialFocus
                                        locale={dateLocale}
                                    />
                                </PopoverContent>
                            </Popover>
                        )}

                        {/* More actions dropdown */}
                        <DropdownMenu modal={false} open={showDropdown} onOpenChange={setShowDropdown}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-7">
                                    <MoreHorizontal className="size-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={handleOpenInNewTab}>
                                    <ExternalLink className="size-4 mr-2" />
                                    {t('task-details')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleShare}>
                                    <Share2Icon className="size-4 mr-2" />
                                    {t('share-task')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleToggleFeatured}>
                                    {subtask.featured ? (
                                        <>
                                            <FlagOffIcon className="size-4 mr-2" />
                                            {t('unfeature-task')}
                                        </>
                                    ) : (
                                        <>
                                            <FlagIcon className="size-4 mr-2" />
                                            {t('feature-task')}
                                        </>
                                    )}
                                </DropdownMenuItem>
                                {subtask.type !== 'epic' && (
                                    <DropdownMenuItem onClick={handleDuplicate}>
                                        <CopyIcon className="size-4 mr-2" />
                                        {t('duplicate-task')}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={handleArchive}>
                                    <ArchiveIcon className="size-4 mr-2" />
                                    {t('archive-task')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="size-4 mr-2" />
                                    {t('delete')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
        </>
    );
};
