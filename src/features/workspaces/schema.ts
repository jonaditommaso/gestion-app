import { z as zod } from 'zod';

export const createWorkspaceSchema = zod.object({
    name: zod.string().trim().min(1, 'field-required')
})

export const updateWorkspaceSchema = zod.object({
    name: zod.string().trim().min(1, 'field-required').optional(),
    description: zod.string().max(2048).optional(),
    metadata: zod.string().optional()
})