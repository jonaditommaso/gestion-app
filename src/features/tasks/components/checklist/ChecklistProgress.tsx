'use client';
import { ChecklistProgress as ChecklistProgressType } from "../../../checklist/types";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ChecklistProgressProps {
    progress: ChecklistProgressType;
    showLabel?: boolean;
    size?: 'sm' | 'md';
    className?: string;
}

export const ChecklistProgress = ({
    progress,
    showLabel = true,
    size = 'md',
    className
}: ChecklistProgressProps) => {
    const { total, completed, percentage } = progress;

    if (total === 0) return null;

    const heightClass = size === 'sm' ? 'h-1.5' : 'h-2';
    const isComplete = percentage === 100;

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Progress
                value={percentage}
                className={cn(heightClass, "flex-1")}
                indicatorClassName={isComplete ? "bg-green-600 dark:bg-green-400" : undefined}
            />
            {showLabel && (
                <span className={cn(
                    "whitespace-nowrap",
                    size === 'sm' ? 'text-xs' : 'text-sm',
                    isComplete
                        ? "text-green-600 dark:text-green-400"
                        : "text-muted-foreground"
                )}>
                    {completed}/{total}
                </span>
            )}
        </div>
    );
};
