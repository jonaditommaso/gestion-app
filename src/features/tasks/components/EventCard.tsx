import { cn } from "@/lib/utils";
import { TaskStatus } from "../types";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useRouter } from "next/navigation";
import React from "react";

interface EventCardProps {
    title: string,
    assignee: any, // type
    status: TaskStatus,
    id: string
}

const statusColorMap: Record<TaskStatus, string> = {
    [TaskStatus.BACKLOG]: 'border-l-pink-500',
    [TaskStatus.TODO]: 'border-l-red-500',
    [TaskStatus.IN_PROGRESS]: 'border-l-yellow-500',
    [TaskStatus.IN_REVIEW]: 'border-l-blue-500',
    [TaskStatus.DONE]: 'border-l-emerald-500',
}

const EventCard = ({ title, assignee, status, id }: EventCardProps) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter()

    const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();

        router.push(`/workspaces/${workspaceId}//tasks/${id}`)
    }

    return (
        <div className="px-2">
            <div className={cn('p-1.5 text-xs bg-white text-primary border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition', statusColorMap[status])} onClick={onClick}>
                <p>{title}</p>
                <div className="flex items-center gap-x-1">
                    <MemberAvatar name={assignee?.name} />
                </div>
            </div>
        </div>
    );
}

export default EventCard;