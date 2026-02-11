import { z as zod } from 'zod';

export const homeConfigSchema = zod.object({
    widgets: zod.string().min(1, 'Required').optional(),
    noteGlobalPinOnboarded: zod.boolean().optional(),
});
