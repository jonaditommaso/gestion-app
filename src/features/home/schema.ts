import { z as zod } from 'zod';

export const notesSchema = zod.object({
    title: zod.string().trim().min(1, 'Required'),
    content: zod.string().trim().min(1, 'Required'),
    bgColor: zod.string().trim().min(1, 'Required'),
})

export const messagesSchema = zod.object({
    content: zod.string().trim().min(1, 'Required'),
    to: zod.string().trim().min(1, 'Required'),
})