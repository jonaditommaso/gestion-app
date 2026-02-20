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

export const profileSchema = zod.object({
    position: zod.string().trim().max(25).optional(),
    description: zod.string().trim().max(100).optional(),
    linkedin: zod.string().trim().optional(),
    tags: zod.array(zod.string().trim().min(1)).max(3),
    birthday: zod.string().trim().optional(),
    memberSince: zod.string().trim().optional(),
    currentProject: zod.string().trim().max(60).optional(),
})