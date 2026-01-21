import { z as zod } from 'zod';

export const requestEnterpriseSchema = zod.object({
    email: zod.string().email(),
    message: zod.string().optional(),
})

export const contactUsSchema = zod.object({
    responsibleName: zod.string().min(1).max(128),
    organizationName: zod.string().min(1).max(128),
    email: zod.string().email().max(50),
    subject: zod.string().min(1).max(128),
    message: zod.string().min(1).max(2048),
})