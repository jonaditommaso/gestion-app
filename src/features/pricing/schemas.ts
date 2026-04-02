import { z as zod } from 'zod';

export const priceSchema = zod.object({
    plan: zod.enum(['plus', 'pro']),
    billing: zod.enum(['monthly', 'annual']).optional().default('monthly'),
    company: zod.string().optional().default(''),
});