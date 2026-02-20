'use client'
import { Task } from "../types";
import TaskDetails, { TaskTitleEditor } from "./TaskDetails";

interface TaskDetailsContentProps {
    task: Task;
    variant?: 'modal' | 'page';
    onClose?: () => void;
    canWrite?: boolean;
}

const TaskDetailsContent = ({ task, variant, onClose, canWrite }: TaskDetailsContentProps) => {
    return <TaskDetails task={task} variant={variant} onClose={onClose} readOnly={!canWrite} />;
};

TaskDetailsContent.TitleEditor = TaskTitleEditor;

export default TaskDetailsContent;
