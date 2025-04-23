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

export const unreadMessagesSchema  = zod.object({
    unreadMessages: zod.array(
        zod.object({
            $id: zod.string(),
            content: zod.string().trim().min(1, 'Required'),
            to: zod.string().trim().min(1, 'Required'),
            read: zod.boolean(),
            $collectionId: zod.string(),
            $databaseId: zod.string(),
            $createdAt: zod.string(),
            $updatedAt: zod.string(),
            $permissions: zod.array(zod.string())
        }))
});

export const shortcutSchema = zod.object({
    text: zod.string().trim().min(1, 'Required'),
    link: zod.string().trim().min(1, 'Required'),
})