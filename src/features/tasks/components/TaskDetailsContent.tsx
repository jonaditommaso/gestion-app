'use client'
import { Task } from "../types";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ExternalLinkIcon, MoreHorizontalIcon, TrashIcon, XIcon } from "lucide-react";
import TaskDetails, { TaskTitleEditor } from "./TaskDetails";

interface TaskDetailsContentProps {
    task: Task;
}

const TaskDetailsActions = ({
    onOpenInNewPage,
    onDelete,
    onClose,
    isDeleting
}: {
    onOpenInNewPage: () => void;
    onDelete: () => void;
    onClose: () => void;
    isDeleting: boolean;
}) => {
    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isDeleting}>
                        <MoreHorizontalIcon className="size-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onOpenInNewPage}>
                        <ExternalLinkIcon className="size-4 mr-2" />
                        Open in new page
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-destructive">
                        <TrashIcon className="size-4 mr-2" />
                        Delete task
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={onClose}>
                <XIcon className="size-5" />
            </Button>
        </div>
    );
};

const TaskDetailsContent = ({ task }: TaskDetailsContentProps) => {
    return <TaskDetails task={task} />;
};

TaskDetailsContent.Actions = TaskDetailsActions;
TaskDetailsContent.TitleEditor = TaskTitleEditor;

export default TaskDetailsContent;
