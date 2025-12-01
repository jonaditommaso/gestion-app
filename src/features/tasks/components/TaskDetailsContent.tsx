'use client'
import { Task } from "../types";
import TaskDetails, { TaskTitleEditor } from "./TaskDetails";

interface TaskDetailsContentProps {
    task: Task;
}

const TaskDetailsContent = ({ task }: TaskDetailsContentProps) => {
    return <TaskDetails task={task} />;
};

TaskDetailsContent.TitleEditor = TaskTitleEditor;

export default TaskDetailsContent;
