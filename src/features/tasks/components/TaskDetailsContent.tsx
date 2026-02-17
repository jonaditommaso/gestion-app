'use client'
import { Task } from "../types";
import TaskDetails, { TaskTitleEditor } from "./TaskDetails";

interface TaskDetailsContentProps {
    task: Task;
    variant?: 'modal' | 'page';
    onClose?: () => void;
}

const TaskDetailsContent = ({ task, variant, onClose }: TaskDetailsContentProps) => {
    return <TaskDetails task={task} variant={variant} onClose={onClose} />;
};

TaskDetailsContent.TitleEditor = TaskTitleEditor;

export default TaskDetailsContent;
