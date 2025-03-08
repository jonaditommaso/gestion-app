import { z as zod } from 'zod';
import { TaskStatus } from './types';

export const createTaskSchema = zod.object({
    name: zod.string().trim().min(1, 'Required'),
    status: zod.nativeEnum(TaskStatus, {required_error: 'Required'}),
    workspaceId: zod.string().trim().min(1, 'Required'),
    dueDate: zod.coerce.date(),
    assigneeId: zod.string().trim().min(1, 'Required'),
    description: zod.string().optional()
})

export const getTaskSchema = zod.object({
    workspaceId: zod.string(),
    assigneeId: zod.string().nullish(),
    status: zod.nativeEnum(TaskStatus).nullish(),
    search: zod.string().nullish(),
    dueDate: zod.string().nullish()
})