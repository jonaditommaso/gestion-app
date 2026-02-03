import { z as zod } from 'zod';
import { TaskShareType, TaskStatus } from './types';

// Custom validation for status: accepts TaskStatus enum values OR custom status IDs (CUSTOM_xxxxx)
const statusSchema = zod.string().refine(
    (val) => Object.values(TaskStatus).includes(val as TaskStatus) || val.startsWith('CUSTOM_'),
    { message: 'Invalid status value' }
);

export const createTaskSchema = zod.object({
    name: zod.string().trim().min(1, 'Required'),
    status: statusSchema,
    statusCustomId: zod.string().optional().nullable(), // ID del custom status cuando status === 'CUSTOM'
    workspaceId: zod.string().trim().min(1, 'Required'),
    dueDate: zod.coerce.date().optional().nullable(),
    assigneesIds: zod.array(zod.string().trim().min(1, 'Required')).optional().default([]),
    priority: zod.number().int().min(1).max(5),
    description: zod.string().optional().nullish(),
    featured: zod.boolean().optional(),
    label: zod.string().max(25).optional().nullish(),
    type: zod.string().optional(),
    metadata: zod.string().optional(), // JSON stringified
    checklistTitle: zod.string().optional().nullable(), // Title of the checklist
    completedAt: zod.coerce.date().optional().nullable(), // Date when task was completed
    parentId: zod.string().optional().nullable(), // ID of the parent task (for subtasks of epics)
})

export const getTaskSchema = zod.object({
    workspaceId: zod.string(),
    assigneeId: zod.string().nullish(),
    status: zod.nativeEnum(TaskStatus).nullish(),
    statusCustomId: zod.string().nullish(), // Para filtrar por custom status específico
    search: zod.string().nullish(),
    dueDate: zod.string().nullish(),
    priority: zod.coerce.number().int().min(1).max(5).nullish(),
    label: zod.string().nullish(),
    type: zod.string().nullish(),
    completed: zod.string().nullish(),
    limit: zod.coerce.number().int().min(1).max(100).nullish() // Límite de resultados
})

export const createTaskShareSchema = zod.object({
    taskId: zod.string().trim().min(1, 'Required'),
    workspaceId: zod.string().trim().min(1, 'Required'),
    token: zod.string().optional(),
    expiresAt: zod.coerce.date().optional(),
    type: zod.nativeEnum(TaskShareType),
    sharedBy: zod.string().trim().min(1, 'Required'),
    sharedTo: zod.string().optional(),
    readOnly: zod.boolean(),
})

export const bulkCreateTaskShareSchema = zod.object({
    taskId: zod.string().trim().min(1, 'Required'),
    taskName: zod.string().trim().min(1, 'Required'),
    workspaceId: zod.string().trim().min(1, 'Required'),
    recipients: zod.array(zod.object({
        memberId: zod.string().trim().min(1, 'Required'),
        userId: zod.string().trim().min(1, 'Required'),
        isWorkspaceMember: zod.boolean(),
    })).min(1, 'At least one recipient is required'),
    message: zod.string().optional(),
    locale: zod.enum(['es', 'en', 'it']).default('es'),
})

// Task Comments schemas
export const createTaskCommentSchema = zod.object({
    taskId: zod.string().trim().min(1, 'Required'),
    content: zod.string().trim().min(1, 'Required'),
})

export const updateTaskCommentSchema = zod.object({
    content: zod.string().trim().min(1, 'Required'),
})

export const getTaskCommentsSchema = zod.object({
    taskId: zod.string().trim().min(1, 'Required'),
})