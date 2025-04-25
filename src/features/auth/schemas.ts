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
    plan: zod.enum(['free', 'pro']),
    isDemo: zod.boolean().optional().default(false) // Added to obtain demo without registering
})

export const userNameSchema = zod.object({
    userName: zod.string().trim().min(1, 'User name cannot be empty')
});

export const mfaSchema = zod.object({
    mfaCode: zod.string().trim().length(6),
    challengeId: zod.string()
});

export const registerByInvitationSchema = zod.object({
    name: zod.string().trim().min(1, 'Required'),
    email: zod.string().email(),
    password: zod.string().min(8, 'Minimo de 8 caracteres'),
    teamId: zod.string().min(1, 'Required'),
    teamName: zod.string().min(1, 'Required'),
    inviteId: zod.string().min(1, 'Required'),
});

export const registerByInvitationFormSchema = zod.object({
    name: zod.string().trim().min(1, 'Required'),
    password: zod.string().min(8, 'Minimo de 8 caracteres'),
    email: zod.string().email(),
})