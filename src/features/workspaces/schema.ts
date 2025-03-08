import { z as zod } from 'zod';

export const createWorkspaceSchema = zod.object({
    name: zod.string().trim().min(1, 'Required')
})