import { Hono } from "hono";
import { zValidator } from '@hono/zod-validator';
import { ID, Query } from "node-appwrite";
import { getNextService } from "@/ai";
import { ChatMessage } from "@/ai/types";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, CHAT_CONVERSATIONS_ID, CHAT_MESSAGES_ID } from "@/config";
import { createConversationSchema, sendChatMessageSchema } from "../schemas";

const app = new Hono()
    // Obtener todas las conversaciones del usuario
    .get(
        '/conversations',
        sessionMiddleware,
        async (ctx) => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');

            const conversations = await databases.listDocuments(
                DATABASE_ID,
                CHAT_CONVERSATIONS_ID,
                [
                    Query.equal('userId', user.$id),
                    Query.orderDesc('$createdAt'),
                    Query.limit(50)
                ]
            );

            return ctx.json({ data: conversations.documents });
        }
    )

    // Obtener una conversación con sus mensajes
    .get(
        '/conversations/:conversationId',
        sessionMiddleware,
        async (ctx) => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');
            const { conversationId } = ctx.req.param();

            // Verificar que la conversación pertenece al usuario
            const conversation = await databases.getDocument(
                DATABASE_ID,
                CHAT_CONVERSATIONS_ID,
                conversationId
            );

            if (conversation.userId !== user.$id) {
                return ctx.json({ error: 'Unauthorized' }, 403);
            }

            // Obtener los mensajes de la conversación
            const messages = await databases.listDocuments(
                DATABASE_ID,
                CHAT_MESSAGES_ID,
                [
                    Query.equal('conversationId', conversationId),
                    Query.orderAsc('$createdAt'),
                    Query.limit(100)
                ]
            );

            return ctx.json({
                data: {
                    ...conversation,
                    messages: messages.documents
                }
            });
        }
    )

    // Crear una nueva conversación
    .post(
        '/conversations',
        zValidator('json', createConversationSchema),
        sessionMiddleware,
        async (ctx) => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');
            const { title } = ctx.req.valid('json');

            const conversation = await databases.createDocument(
                DATABASE_ID,
                CHAT_CONVERSATIONS_ID,
                ID.unique(),
                {
                    title,
                    userId: user.$id,
                    teamId: user.prefs.teamId,
                }
            );

            return ctx.json({ data: conversation });
        }
    )

    // Actualizar título de conversación
    // .patch(
    //     '/conversations/:conversationId',
    //     zValidator('json', updateConversationSchema),
    //     sessionMiddleware,
    //     async (ctx) => {
    //         const databases = ctx.get('databases');
    //         const user = ctx.get('user');
    //         const { conversationId } = ctx.req.param();
    //         const { title } = ctx.req.valid('json');

    //         // Verificar que la conversación pertenece al usuario
    //         const conversation = await databases.getDocument(
    //             DATABASE_ID,
    //             CHAT_CONVERSATIONS_ID,
    //             conversationId
    //         );

    //         if (conversation.userId !== user.$id) {
    //             return ctx.json({ error: 'Unauthorized' }, 403);
    //         }

    //         const updated = await databases.updateDocument(
    //             DATABASE_ID,
    //             CHAT_CONVERSATIONS_ID,
    //             conversationId,
    //             { title }
    //         );

    //         return ctx.json({ data: updated });
    //     }
    // )

    // Eliminar una conversación
    .delete(
        '/conversations/:conversationId',
        sessionMiddleware,
        async (ctx) => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');
            const { conversationId } = ctx.req.param();

            // Verificar que la conversación pertenece al usuario
            const conversation = await databases.getDocument(
                DATABASE_ID,
                CHAT_CONVERSATIONS_ID,
                conversationId
            );

            if (conversation.userId !== user.$id) {
                return ctx.json({ error: 'Unauthorized' }, 403);
            }

            // Eliminar todos los mensajes de la conversación
            const messages = await databases.listDocuments(
                DATABASE_ID,
                CHAT_MESSAGES_ID,
                [Query.equal('conversationId', conversationId)]
            );

            await Promise.all(
                messages.documents.map(msg =>
                    databases.deleteDocument(DATABASE_ID, CHAT_MESSAGES_ID, msg.$id)
                )
            );

            // Eliminar la conversación
            await databases.deleteDocument(
                DATABASE_ID,
                CHAT_CONVERSATIONS_ID,
                conversationId
            );

            return ctx.json({ data: { success: true } });
        }
    )

    // Enviar mensaje y obtener respuesta de IA (con streaming)
    .post(
        '/',
        zValidator('json', sendChatMessageSchema),
        sessionMiddleware,
        async (ctx) => {
            const databases = ctx.get('databases');
            const user = ctx.get('user');
            const { messages, conversationId: existingConversationId } = ctx.req.valid('json');

            let conversationId = existingConversationId;

            // Si no hay conversationId, crear una nueva conversación
            if (!conversationId) {
                const firstUserMessage = messages.find(m => m.role === 'user');
                const title = firstUserMessage?.content.substring(0, 100) || 'New conversation';

                const conversation = await databases.createDocument(
                    DATABASE_ID,
                    CHAT_CONVERSATIONS_ID,
                    ID.unique(),
                    {
                        title,
                        userId: user.$id,
                        teamId: user.prefs.teamId,
                    }
                );
                conversationId = conversation.$id;
            }

            // Guardar el último mensaje del usuario (el nuevo)
            const lastUserMessage = messages[messages.length - 1];
            if (lastUserMessage && lastUserMessage.role === 'user') {
                await databases.createDocument(
                    DATABASE_ID,
                    CHAT_MESSAGES_ID,
                    ID.unique(),
                    {
                        conversationId,
                        content: lastUserMessage.content.substring(0, 16384),
                        role: 'USER',
                    }
                );
            }

            // Obtener respuesta de la IA
            const service = getNextService();
            const aiMessages: ChatMessage[] = messages.map(m => ({
                role: m.role,
                content: m.content
            }));
            const stream = await service.chat(aiMessages);

            // Acumular la respuesta completa para guardarla
            let fullResponse = '';

            // Crear un ReadableStream que también guarde la respuesta
            const readableStream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of stream) {
                            if (chunk) {
                                fullResponse += chunk;
                                controller.enqueue(new TextEncoder().encode(chunk));
                            }
                        }

                        // Guardar la respuesta completa del asistente
                        if (fullResponse.trim()) {
                            await databases.createDocument(
                                DATABASE_ID,
                                CHAT_MESSAGES_ID,
                                ID.unique(),
                                {
                                    conversationId,
                                    content: fullResponse.substring(0, 16384),
                                    role: 'ASSISTANT',
                                    model: service.model,
                                }
                            );
                        }

                        controller.close();
                    } catch (error) {
                        controller.error(error);
                    }
                }
            });

            return new Response(readableStream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'X-Conversation-Id': conversationId,
                    'X-Model-Name': service.displayName,
                }
            });
        }
    );

export default app;
