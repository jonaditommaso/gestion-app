'use client';
import { ChecklistProgress as ChecklistProgressType } from "../types";
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

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Progress
                value={percentage}
                className={cn(heightClass, "flex-1")}
            />
            {showLabel && (
                <span className={cn(
                    "text-muted-foreground whitespace-nowrap",
                    size === 'sm' ? 'text-xs' : 'text-sm'
                )}>
                    {completed}/{total}
                </span>
            )}
        </div>
    );
};
