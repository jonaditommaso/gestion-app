import { z as zod } from 'zod';

export const priceSchema = zod.object({
    plan: zod.enum(['pro', 'pro-plus']),
    billing: zod.enum(['monthly', 'annual']).optional().default('monthly'),
    company: zod.string().optional().default(''),
});