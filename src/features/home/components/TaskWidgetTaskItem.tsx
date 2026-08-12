'use client'

import { useEffect, useRef, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import { useUpdateTask } from '@/features/tasks/api/use-update-task';
import { TASK_PRIORITY_OPTIONS } from '@/features/tasks/constants/priority';
import type { Task } from '@/features/tasks/types';

interface TaskWidgetTaskItemProps {
    task: Task;
    statusColor: string;
}

const TaskWidgetTaskItem = ({ task, statusColor }: TaskWidgetTaskItemProps) => {
    const locale = useLocale();
    const t = useTranslations('home');
    const tWorkspaces = useTranslations('workspaces');
    const { mutate: updateTask } = useUpdateTask();
    const [optimisticCompleted, setOptimisticCompleted] = useState<boolean | null>(null);
    const prevCompletedAt = useRef(task.completedAt);

    useEffect(() => {
        if (task.completedAt !== prevCompletedAt.current) {
            prevCompletedAt.current = task.completedAt;
            setOptimisticCompleted(null);
        }
    }, [task.completedAt]);

    const isCompleted = optimisticCompleted !== null ? optimisticCompleted : !!task.completedAt;
    const priorityOption = TASK_PRIORITY_OPTIONS.find(option => option.value === (task.priority || 3));
    const PriorityIcon = priorityOption?.icon;

    const handleToggleComplete = (checked: boolean | 'indeterminate') => {
        const nextCompletedState = checked === true;
        setOptimisticCompleted(nextCompletedState);
        const newCompletedAt = nextCompletedState ? new Date().toISOString() : null;
        updateTask({
            json: { completedAt: newCompletedAt as unknown as Date },
            param: { taskId: task.$id }
        });
    };

    return (
        <div
            className="border bg-sidebar p-2 rounded-md border-l-4 flex items-start justify-between gap-2"
            style={{ borderLeftColor: statusColor }}
        >
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <Checkbox
                    checked={isCompleted}
                    onCheckedChange={handleToggleComplete}
                    className="h-4 w-4 rounded-sm border-muted-foreground/50 data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white"
                />
                <div className="min-w-0">
                    <p className={cn('font-medium truncate', isCompleted && 'line-through text-muted-foreground')}>
                        {task.name}
                    </p>
                    {task.dueDate && (
                        <p className={cn('text-sm text-muted-foreground', isCompleted && 'line-through text-muted-foreground/80')}>
                            {t('limit-date')}:{' '}
                            <relative-time lang={locale} datetime={task.dueDate}></relative-time>
                        </p>
                    )}
                </div>
            </div>
            {priorityOption && PriorityIcon && (
                <span
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap self-center"
                    style={{
                        borderColor: `${priorityOption.color}33`,
                        backgroundColor: `${priorityOption.color}12`,
                        color: priorityOption.color,
                    }}
                >
                    <PriorityIcon className="h-3.5 w-3.5" style={{ color: priorityOption.color }} />
                    {tWorkspaces(priorityOption.translationKey)}
                </span>
            )}
        </div>
    );
};

export default TaskWidgetTaskItem;
