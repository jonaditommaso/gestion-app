import { z } from 'zod';

export const ChatRole = {
    USER: 'USER',
    ASSISTANT: 'ASSISTANT',
    SYSTEM: 'SYSTEM',
} as const;

export type ChatRoleType = typeof ChatRole[keyof typeof ChatRole];

export const createConversationSchema = z.object({
    title: z.string().trim().min(1).max(100),
});

// export const updateConversationSchema = z.object({
//     title: z.string().trim().min(1).max(100).optional(),
// });

export const createMessageSchema = z.object({
    conversationId: z.string().trim().min(1),
    content: z.string().trim().min(1).max(16384),
    role: z.enum(['USER', 'ASSISTANT', 'SYSTEM']),
});

export const sendChatMessageSchema = z.object({
    conversationId: z.string().optional(), // Si no existe, se crea una nueva conversación
    messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string()
    }))
});
