import { z as zod } from 'zod';

export const tagsSchema = zod.object({
    tag: zod.string().trim().min(1, 'Required')
})

export const birthdaySchema = zod.object({
    birthday: zod.string().trim() // put real schema
})

export const inviteSchema = zod.object({
    email: zod.string().email()
})