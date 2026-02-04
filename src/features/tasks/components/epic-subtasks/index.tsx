'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Task, TaskStatus } from '../../types';
import { useGetSubtasks } from '../../api/use-get-subtasks';
import { useCreateTask } from '../../api/use-create-task';
import { useDeleteTask } from '../../api/use-delete-task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Plus, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EpicSubtaskRow } from './EpicSubtaskRow';
import { useConfirm } from '@/hooks/use-confirm';
import { useArchiveTask } from '../../api/use-archive-task';

interface EpicSubtasksProps {
    epic: Task;
    onNavigate?: (subtaskId: string) => void;
    availableMembers?: { $id: string; name: string }[];
    hideProgressBar?: boolean;
}

// Optimistic subtask type for pending items
interface OptimisticSubtask {
    $id: string;
    name: string;
    status: TaskStatus;
    completedAt?: string | null;
    priority?: number;
    label?: string;
    dueDate?: string;
    isOptimistic: true;
}

type SubtaskItem = Task | OptimisticSubtask;

export const EpicSubtasks = ({ epic, onNavigate, availableMembers = [], hideProgressBar = false }: EpicSubtasksProps) => {
    const t = useTranslations('workspaces');
    const [newTaskName, setNewTaskName] = useState('');
    const [isInputVisible, setIsInputVisible] = useState(false);
    const [optimisticSubtasks, setOptimisticSubtasks] = useState<OptimisticSubtask[]>([]);
    const [isUpdatingCompletion, setIsUpdatingCompletion] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data, isLoading } = useGetSubtasks({ parentId: epic.$id, workspaceId: epic.workspaceId });
    const { mutate: createTask, isPending: isCreating } = useCreateTask();
    const { mutate: deleteTask } = useDeleteTask();
    const { archiveTask } = useArchiveTask();

    const [DeleteSubtaskDialog, confirmDeleteSubtask] = useConfirm(
        t('delete-subtask'),
        t('delete-subtask-confirm'),
        'destructive'
    );

    const [ArchiveSubtaskDialog, confirmArchiveSubtask] = useConfirm(
        t('archive-task-confirm'),
        t('archive-task-confirm-message'),
        'default'
    );

    const [DeleteAllDialog, confirmDeleteAll] = useConfirm(
        t('delete-all-subtasks'),
        t('delete-all-subtasks-confirm'),
        'destructive'
    );

    // Server subtasks sorted by position
    const serverSubtasks = useMemo(() =>
        ((data?.documents || []) as Task[]).sort((a, b) => a.position - b.position),
        [data?.documents]
    );

    // Combine optimistic and server subtasks
    const subtasks: SubtaskItem[] = useMemo(() => {
        // Filter out optimistic items that now exist on server
        const serverIds = new Set(serverSubtasks.map(t => t.$id));
        const pendingOptimistic = optimisticSubtasks.filter(o => !serverIds.has(o.$id));
        return [...serverSubtasks, ...pendingOptimistic];
    }, [serverSubtasks, optimisticSubtasks]);

    const hasSubtasks = subtasks.length > 0;

    // Calculate progress based on completedAt
    const progress = useMemo(() => {
        const total = subtasks.length;
        const completed = subtasks.filter(t => !!t.completedAt).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, percentage };
    }, [subtasks]);

    // Focus input when it becomes visible
    useEffect(() => {
        if (isInputVisible && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isInputVisible]);

    // Remove optimistic subtasks when they appear from server
    useEffect(() => {
        if (optimisticSubtasks.length > 0) {
            const serverIds = new Set(serverSubtasks.map(t => t.$id));
            const stillPending = optimisticSubtasks.filter(o => !serverIds.has(o.$id));
            if (stillPending.length !== optimisticSubtasks.length) {
                setOptimisticSubtasks(stillPending);
            }
        }
    }, [serverSubtasks, optimisticSubtasks]);

    const handleAddSubtask = () => {
        if (!newTaskName.trim()) return;

        const tempId = `temp_${Date.now()}`;
        const name = newTaskName.trim();

        // Add optimistic subtask (inherit status and label from epic)
        setOptimisticSubtasks(prev => [...prev, {
            $id: tempId,
            name,
            status: epic.status,
            completedAt: null,
            priority: 3,
            label: epic.label,
            isOptimistic: true
        }]);

        // Clear input immediately
        setNewTaskName('');

        // Create the task (inherit status, statusCustomId and label from epic)
        createTask({
            json: {
                name,
                workspaceId: epic.workspaceId,
                parentId: epic.$id,
                status: epic.status,
                statusCustomId: epic.statusCustomId,
                label: epic.label,
                priority: 3,
            }
        }, {
            onError: () => {
                // Remove optimistic subtask on error
                setOptimisticSubtasks(prev => prev.filter(o => o.$id !== tempId));
            }
        });

        // Keep focus on input
        requestAnimationFrame(() => {
            inputRef.current?.focus();
        });
    };

    const handleInputBlur = () => {
        if (!newTaskName.trim()) {
            setIsInputVisible(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSubtask();
        } else if (e.key === 'Escape') {
            setNewTaskName('');
            setIsInputVisible(false);
        }
    };

    const handleDeleteSubtask = async (subtaskId: string) => {
        const ok = await confirmDeleteSubtask();
        if (!ok) return;
        deleteTask({ param: { taskId: subtaskId } });
    };

    const handleArchiveSubtask = async (subtaskId: string) => {
        const ok = await confirmArchiveSubtask();
        if (!ok) return;
        archiveTask(subtaskId);
    };

    const handleCompletionUpdate = (isUpdating: boolean) => {
        setIsUpdatingCompletion(isUpdating);
    };

    const handleDeleteAll = async () => {
        const ok = await confirmDeleteAll();
        if (!ok) return;

        // Delete all subtasks
        for (const subtask of serverSubtasks) {
            deleteTask({ param: { taskId: subtask.$id } });
        }
    };

    // No subtasks yet - show add button
    if (!hasSubtasks && !isInputVisible) {
        return (
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsInputVisible(true)}
                className="text-muted-foreground hover:text-foreground"
            >
                <Plus className="size-4 mr-2" />
                {t('add-subtask')}
            </Button>
        );
    }

    if (isLoading && !hasSubtasks) {
        return (
            <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-10 bg-muted rounded animate-pulse" />
                <div className="h-10 bg-muted rounded animate-pulse" />
            </div>
        );
    }

    const isComplete = progress.percentage === 100;

    return (
        <>
            <DeleteSubtaskDialog />
            <ArchiveSubtaskDialog />
            <DeleteAllDialog />
            <div className="space-y-3">
                {/* Progress bar with delete all button */}
                {!hideProgressBar && progress.total > 0 && (
                    <div className="flex items-center gap-2">
                        <Progress
                            value={progress.percentage}
                            className="h-2 flex-1"
                            indicatorClassName={isComplete ? "bg-green-600 dark:bg-green-400" : undefined}
                        />
                        {isUpdatingCompletion ? (
                            <div className="flex items-center gap-1 min-w-[3rem] justify-center">
                                <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <span className={cn(
                                "text-sm whitespace-nowrap min-w-[3rem] text-center",
                                isComplete
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-muted-foreground"
                            )}>
                                {progress.completed}/{progress.total}
                            </span>
                        )}
                        {hasSubtasks && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleDeleteAll}
                                className="size-7 text-muted-foreground hover:text-destructive"
                            >
                                <X className="size-4" />
                            </Button>
                        )}
                    </div>
                )}

                {/* Subtasks list */}
                {subtasks.length > 0 && (
                    <div className="space-y-1">
                        {subtasks.map((subtask) => (
                            <EpicSubtaskRow
                                key={subtask.$id}
                                subtask={subtask as Task}
                                onDelete={handleDeleteSubtask}
                                onArchive={handleArchiveSubtask}
                                isOptimistic={'isOptimistic' in subtask}
                                onNavigate={onNavigate}
                                availableMembers={availableMembers}
                                onCompletionUpdate={handleCompletionUpdate}
                            />
                        ))}
                    </div>
                )}

                {/* Add subtask input */}
                {isInputVisible ? (
                    <div className="flex items-center gap-2">
                        <Input
                            ref={inputRef}
                            value={newTaskName}
                            onChange={(e) => setNewTaskName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleInputBlur}
                            placeholder={t('subtask-name-placeholder')}
                            disabled={isCreating}
                            className="h-9"
                        />
                        <Button
                            size="sm"
                            onClick={handleAddSubtask}
                            disabled={!newTaskName.trim() || isCreating}
                        >
                            <Plus className="size-4" />
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsInputVisible(true)}
                        className="text-muted-foreground hover:text-foreground w-full justify-start"
                    >
                        <Plus className="size-4 mr-2" />
                        {t('add-subtask')}
                    </Button>
                )}
            </div>
        </>
    );
};
