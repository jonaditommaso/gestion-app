import { cn } from "@/lib/utils";
import { TaskStatus } from "../types";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useRouter } from "next/navigation";
import React from "react";
import { statusColorMap } from "../constants/status";
import { useTranslations } from "next-intl";

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
    featured?: boolean
}

const EventCard = ({ title, assignees, status, id, featured }: EventCardProps) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();
    const t = useTranslations('workspaces');

    const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();

        router.push(`/workspaces/${workspaceId}//tasks/${id}`)
    }

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
                <div className="flex items-center gap-x-1">
                    {assignees && assignees.length > 0 ? (
                        <>
                            <MemberAvatar name={assignees[0].name} memberId={assignees[0].$id} />
                            {assignees.length > 1 && (
                                <span className="text-[10px] text-muted-foreground">+{assignees.length - 1}</span>
                            )}
                        </>
                    ) : (
                        <span className="text-[10px] text-muted-foreground">{t('no-assignee')}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EventCard;