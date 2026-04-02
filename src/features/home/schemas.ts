import { z as zod } from 'zod';

export const notesSchema = zod.object({
    title: zod.string().optional(),
    content: zod.string().optional(),
    bgColor: zod.string().trim().min(1, 'Required').optional(),
    isModern: zod.boolean().optional(),
    hasLines: zod.boolean().optional(),
    isPinned: zod.boolean().optional(),
    pinnedAt: zod.string().nullable().optional(),
    isGlobal: zod.boolean().optional(),
    globalAt: zod.string().nullable().optional(),
    reminderAt: zod.string().nullable().optional(),
    reminderNotified: zod.boolean().optional(),
})

export const messagesSchema = zod.object({
    subject: zod.string().trim().min(1, 'Required').max(100, 'Max 100 chars'),
    content: zod.string().trim().min(1, 'Required'),
    toTeamMemberIds: zod.array(zod.string().trim().min(1, 'Required')).min(1, 'At least one recipient is required'),
})

export const unreadMessagesSchema = zod.object({
    unreadMessages: zod.array(
        zod.object({
            $id: zod.string(),
            content: zod.string().trim().min(1, 'Required'),
            toTeamMemberId: zod.string().trim().min(1, 'Required'),
            read: zod.boolean(),
            $collectionId: zod.string(),
            $databaseId: zod.string(),
            $createdAt: zod.string(),
            $updatedAt: zod.string(),
            $permissions: zod.array(zod.string())
        }))
});

export const updateMessageSchema = zod.object({
    read: zod.boolean().optional(),
    featured: zod.boolean().optional(),
    deletedByRecipient: zod.boolean().optional(),
    deletedBySender: zod.boolean().optional(),
});

export const shortcutSchema = zod.object({
    text: zod.string().trim().min(1, 'Required'),
    link: zod.string().trim().min(1, 'Required'),
    slot: zod.enum(['shortcut', 'shortcut2']).optional(),
})

export const meetSchemaForm = zod.object({
    invited: zod.string().trim().min(1, 'Required'),
    title: zod.string().trim().min(1, 'Required'),
    dateStart: zod.preprocess(
        (arg) => typeof arg === 'string' ? new Date(arg) : arg,
        zod.date()
    ),
    timeStart: zod.preprocess(
        (arg) => typeof arg === 'string' ? new Date(arg) : arg,
        zod.date()
    ),
    duration: zod.string()
})

export const meetSchema = zod.object({
    invited: zod.string().trim().min(1, 'Required'),
    title: zod.string().trim().min(1, 'Required'),
    dateStart: zod.preprocess(
        (arg) => typeof arg === 'string' ? new Date(arg) : arg,
        zod.date()
    ),
    duration: zod.string(),
    userId: zod.string()
})