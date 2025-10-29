import { MoreHorizontalIcon, TextIcon } from "lucide-react";
import { Task } from "../types";
import TaskActions from "./TaskActions";
import { Separator } from "@/components/ui/separator";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import TaskDate from "./TaskDate";
import { TASK_PRIORITY_OPTIONS } from "../constants/priority";
import { useState } from "react";
import TaskDetailsModal from "./TaskDetailsModal";

interface KanbanCardProps {
    task: Task
}

const KanbanCard = ({ task }: KanbanCardProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const priorityOption = TASK_PRIORITY_OPTIONS.find(p => p.value === (task.priority || 3))!
    const PriorityIcon = priorityOption.icon

    return (
        <>
            <TaskDetailsModal
                taskId={task.$id}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
            <div
                className="bg-card p-2.5 mb-1.5 rounded shadow-md space-y-3 cursor-pointer hover:shadow-lg transition"
                onClick={() => setIsModalOpen(true)}
            >
            <div>
                <div className="flex items-start justify-between gap-x-2">
                    <p className="text-sm line-clamp-2">{task.name}</p>
                    <div onClick={(e) => e.stopPropagation()}>
                        <TaskActions id={task.$id}>
                            <MoreHorizontalIcon className="size-[18px] stroke-1 shrink-0 text-neutral-700 hover:opacity-75 transition" />
                        </TaskActions>
                    </div>
                </div>
                <div className="flex items-start justify-between gap-x-2">
                    <div>
                        {task.description && <TextIcon className="size-4 text-neutral-500" />}
                    </div>
                    <PriorityIcon
                        className="size-4"
                        style={{ color: priorityOption.color }}
                    />
                </div>

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
        </>
    );
}

export default KanbanCard;