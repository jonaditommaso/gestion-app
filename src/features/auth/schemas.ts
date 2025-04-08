import { z as zod } from 'zod';

export const loginSchema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(8, 'Minimo de 8 caracteres')
})

export const registerSchema = zod.object({
    company: zod.string().trim().min(1, 'Required'),
    name: zod.string().trim().min(1, 'Required'),
    email: zod.string().email(),
    password: zod.string().min(8, 'Minimo de 8 caracteres'),
    plan: zod.enum(['free', 'pro'])
})

export const userNameSchema = zod.object({
    userName: zod.string().trim().min(1, 'User name cannot be empty')
});