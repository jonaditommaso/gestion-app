import { TaskStatus } from "./types";

export const TASK_STATUS_OPTIONS = [
    {
        value: TaskStatus.BACKLOG,
        translationKey: 'backlog'
    },
    {
        value: TaskStatus.TODO,
        translationKey: 'todo'
    },
    {
        value: TaskStatus.IN_PROGRESS,
        translationKey: 'in-progress'
    },
    {
        value: TaskStatus.IN_REVIEW,
        translationKey: 'in-review'
    },
    {
        value: TaskStatus.DONE,
        translationKey: 'done'
    }
] as const;
