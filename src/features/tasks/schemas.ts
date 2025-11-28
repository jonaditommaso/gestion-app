import { z as zod } from 'zod';
import { TaskStatus } from './types';

export const createTaskSchema = zod.object({
    name: zod.string().trim().min(1, 'Required'),
    status: zod.nativeEnum(TaskStatus, { required_error: 'Required' }),
    statusCustomId: zod.string().optional().nullable(), // ID del custom status cuando status === 'CUSTOM'
    workspaceId: zod.string().trim().min(1, 'Required'),
    dueDate: zod.coerce.date().optional().nullable(),
    assigneesIds: zod.array(zod.string().trim().min(1, 'Required')).optional().default([]),
    priority: zod.number().int().min(1).max(5),
    description: zod.string().optional().nullish(),
    featured: zod.boolean().optional(),
    label: zod.string().max(25).optional(),
    type: zod.string().optional(),
    metadata: zod.string().optional(), // JSON stringified
})

export const getTaskSchema = zod.object({
    workspaceId: zod.string(),
    assigneeId: zod.string().nullish(),
    status: zod.nativeEnum(TaskStatus).nullish(),
    search: zod.string().nullish(),
    dueDate: zod.string().nullish(),
    priority: zod.coerce.number().int().min(1).max(5).nullish()
})