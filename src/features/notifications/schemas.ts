import { z as zod } from 'zod';

export const notificationsSchema = zod.object({
    userId: zod.string().trim().min(1, 'Required').optional(),
    triggeredBy: zod.string().trim().min(1, 'Required').optional(),
    title: zod.string().trim().min(1, 'Required'),
    read: zod.boolean().optional(),
    type: zod.string().trim().min(1, 'Required'),
    entityType: zod.string().trim().min(1, 'Required'),
    body: zod.string().trim().optional(),
})