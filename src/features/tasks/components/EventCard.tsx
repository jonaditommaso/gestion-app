import { cn } from "@/lib/utils";
import { TaskStatus } from "../types";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { statusColorMap } from "../constants/status";
import { useCustomLabels } from "@/app/workspaces/hooks/use-custom-labels";
import { motion, AnimatePresence } from "motion/react";

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
    label?: string
}

const EventCard = ({ title, assignees, status, id, featured, label }: EventCardProps) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();
    const { getLabelById, getLabelColor } = useCustomLabels();
    const [isLabelHovered, setIsLabelHovered] = useState(false);

    const labelData = label?.startsWith('LABEL_') ? getLabelById(label) : null;
    const labelColorData = labelData ? getLabelColor(labelData.color) : null;

    const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();

        router.push(`/workspaces/${workspaceId}//tasks/${id}`)
    }

    const hasAssignees = assignees && assignees.length > 0;
    const hasContent = hasAssignees || labelData;

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
                <p>{title}</p>
                {hasContent && (
                    <div className="flex items-center gap-x-1.5">
                        {hasAssignees && (
                            <>
                                <MemberAvatar name={assignees[0].name} memberId={assignees[0].$id} />
                                {assignees.length > 1 && (
                                    <span className="text-[10px] text-muted-foreground">+{assignees.length - 1}</span>
                                )}
                            </>
                        )}
                        {labelData && (
                            <div
                                className="relative flex items-center"
                                onMouseEnter={() => setIsLabelHovered(true)}
                                onMouseLeave={() => setIsLabelHovered(false)}
                            >
                                <div
                                    className="size-3 rounded-full flex-shrink-0 ring-1 ring-black/10"
                                    style={{ backgroundColor: labelData.color }}
                                />
                                <AnimatePresence>
                                    {isLabelHovered && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, x: -4 }}
                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, x: -4 }}
                                            transition={{ duration: 0.15, ease: 'easeOut' }}
                                            className="absolute left-4 z-50 whitespace-nowrap"
                                        >
                                            <span
                                                className="px-1.5 py-0.5 rounded text-[10px] font-medium shadow-sm"
                                                style={{
                                                    backgroundColor: labelData.color,
                                                    color: labelColorData?.textColor || '#000',
                                                }}
                                            >
                                                {labelData.name}
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default EventCard;