import { z as zod } from 'zod';

export const requestEnterpriseSchema = zod.object({
    email: zod.string().email(),
    message: zod.string().optional(),
})