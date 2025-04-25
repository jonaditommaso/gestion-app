import { z as zod } from 'zod';

export const priceSchema = zod.object({
    plan: zod.string()
});