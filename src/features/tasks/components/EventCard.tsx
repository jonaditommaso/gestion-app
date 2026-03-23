import { cn } from "@/lib/utils";
import { TaskStatus } from "../types";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import React from "react";
import { statusColorMap } from "../constants/status";
import { useCustomLabels } from "@/app/workspaces/hooks/use-custom-labels";
import { TASK_TYPE_OPTIONS } from "../constants/type";
import { TASK_PRIORITY_OPTIONS } from "../constants/priority";

interface EventCardProps {
    title: string,
    assignees?: Array<{
        $id: string,
        name: string,
        email: string,
        avatarId?: string,
    }>,
    status: TaskStatus,
    id: string,
    featured?: boolean,
    label?: string,
    type?: string,
    priority?: number,
    onOpenTask: (taskId: string) => void,
}

const EventCard = ({ title, assignees, status, id, featured, label, type, priority, onOpenTask }: EventCardProps) => {
    const { getLabelById, getLabelColor } = useCustomLabels();

    const labelData = label?.startsWith('LABEL_') ? getLabelById(label) : null;
    const labelColorData = labelData ? getLabelColor(labelData.color) : null;
    const plainLabel = label && !label.startsWith('LABEL_') ? label : null;

    const typeOption = TASK_TYPE_OPTIONS.find(t => t.value === (type || 'task'))!;
    const TypeIcon = typeOption.icon;
    const priorityOption = TASK_PRIORITY_OPTIONS.find(p => p.value === (priority || 3))!;
    const PriorityIcon = priorityOption.icon;

    const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        onOpenTask(id);
    }

    const hasAssignees = assignees && assignees.length > 0;

    return (
        <div className="px-2 mb-1">
            <div
                className={cn(
                    'p-1.5 text-xs text-primary border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition',
                    featured ? 'bg-yellow-50/80 dark:bg-yellow-950/20' : 'bg-secondary',
                    statusColorMap[status]
                )}
                onClick={onClick}
            >
                <p className="leading-snug">{title}</p>
                <div className="flex items-center justify-between gap-x-1">
                    <div className="flex items-center gap-x-1.5">
                        <TypeIcon className={cn("size-3 flex-shrink-0", typeOption.textColor)} />
                        <PriorityIcon
                            className="size-3 flex-shrink-0"
                            style={{ color: priorityOption.color }}
                        />
                        {labelData && (
                            <div
                                className="px-1 py-0.5 rounded text-[10px] font-medium leading-none flex-shrink-0"
                                style={{
                                    backgroundColor: labelData.color,
                                    color: labelColorData?.textColor || '#000',
                                }}
                            >
                                {labelData.name}
                            </div>
                        )}
                        {plainLabel && (
                            <span className="px-1 py-0.5 rounded text-[10px] font-medium leading-none bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 flex-shrink-0 truncate max-w-[60px]">
                                {plainLabel}
                            </span>
                        )}
                    </div>
                    {hasAssignees && (
                        <div className="flex items-center gap-x-1">
                            <MemberAvatar
                                name={assignees[0].name}
                                memberId={assignees[0].$id}
                                className="size-4"
                                fallbackClassName="text-[8px]"
                            />
                            {assignees.length > 1 && (
                                <span className="text-[10px] text-muted-foreground">+{assignees.length - 1}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EventCard;