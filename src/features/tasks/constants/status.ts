import { TaskStatus } from "../types";

export const TASK_STATUS_OPTIONS = [
    {
        value: TaskStatus.BACKLOG,
        translationKey: 'backlog',
        color: 'bg-pink-300'
    },
    {
        value: TaskStatus.TODO,
        translationKey: 'todo',
        color: 'bg-red-300'
    },
    {
        value: TaskStatus.IN_PROGRESS,
        translationKey: 'in-progress',
        color: 'bg-yellow-300'
    },
    {
        value: TaskStatus.IN_REVIEW,
        translationKey: 'in-review',
        color: 'bg-blue-300'
    },
    {
        value: TaskStatus.DONE,
        translationKey: 'done',
        color: 'bg-emerald-300'
    }
] as const;

export const statusColorMap: Record<TaskStatus, string> = {
    [TaskStatus.BACKLOG]: 'border-l-pink-500',
    [TaskStatus.TODO]: 'border-l-red-500',
    [TaskStatus.IN_PROGRESS]: 'border-l-yellow-500',
    [TaskStatus.IN_REVIEW]: 'border-l-blue-500',
    [TaskStatus.DONE]: 'border-l-emerald-500',
}