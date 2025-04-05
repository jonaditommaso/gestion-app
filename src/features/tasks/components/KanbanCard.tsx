import { MoreHorizontalIcon } from "lucide-react";
import { Task } from "../types";
import TaskActions from "./TaskActions";
import { Separator } from "@/components/ui/separator";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import TaskDate from "./TaskDate";

interface KanbanCardProps {
    task: Task
}

const KanbanCard = ({ task }: KanbanCardProps) => {
    return (
        <div className="bg-card p-2.5 mb-1.5 rounded shadow-md space-y-3">
            <div className="flex items-start justify-between gap-x-2">
                <p className="text-sm line-clamp-2">{task.name}</p>
                <TaskActions id={task.$id}>
                    <MoreHorizontalIcon className="size-[18px] stroke-1 shrink-0 text-neutral-700 hover:opacity-75 transition" />
                </TaskActions>
            </div>
            <Separator />
            <div className="flex items-center gap-x-1.5">
                <MemberAvatar
                    name={task.assignee.name}
                    fallbackClassName="text-[10px]"
                />
                <div className="size-1 rounded-full bg-neutral-300" />
                <TaskDate value={task.dueDate} className="text-xs" />
            </div>
        </div>
    );
}

export default KanbanCard;