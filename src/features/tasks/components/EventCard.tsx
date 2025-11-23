import { cn } from "@/lib/utils";
import { TaskStatus } from "../types";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useRouter } from "next/navigation";
import React from "react";
import { statusColorMap } from "../constants/status";

interface EventCardProps {
    title: string,
    // todo, solve this any, and search this (eslint-disable-next-line @typescript-eslint/no-explicit-any) in another files to solve it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assignee: any, // type
    status: TaskStatus,
    id: string,
    featured?: boolean
}

const EventCard = ({ title, assignee, status, id, featured }: EventCardProps) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter()

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
                    <MemberAvatar name={assignee?.name} />
                </div>
            </div>
        </div>
    );
}

export default EventCard;