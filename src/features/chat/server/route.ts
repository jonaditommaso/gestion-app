import { Hono } from "hono";
import { zValidator } from '@hono/zod-validator';
import { ID, Query } from "node-appwrite";
import { getNextService } from "@/ai";
import { ChatMessage } from "@/ai/types";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, CHAT_CONVERSATIONS_ID, CHAT_MESSAGES_ID, NOTES_ID } from "@/config";
import { createConversationSchema, sendChatMessageSchema } from "../schemas";
import { CreateNoteArgs } from "@/ai/tools";

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
    /**
     * =============================================================================
     * ENDPOINT PRINCIPAL DEL CHAT CON FUNCTION CALLING
     * =============================================================================
     *
     * FLUJO DE FUNCTION CALLING:
     *
     * 1. Usuario envía mensaje: "Crea una nota que diga que mañana debo trabajar"
     * 2. Enviamos el mensaje a la IA CON las herramientas disponibles
     * 3. La IA analiza y decide: "Necesito usar create_note"
     * 4. La IA devuelve: { type: 'tool_call', toolCalls: [{ name: 'create_note', arguments: {...} }] }
     * 5. NOSOTROS ejecutamos la función real (crear nota en la BD)
     * 6. Devolvemos al usuario un mensaje confirmando la acción
     *
     * Si la IA no necesita usar herramientas, simplemente responde con texto normal.
     */
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

            // Obtener el servicio de IA
            const service = getNextService();
            const aiMessages: ChatMessage[] = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            // =====================================================================
            // PASO CLAVE: Intentar usar chatWithTools si está disponible
            // =====================================================================
            //
            // Primero intentamos con function calling. Si el servicio no lo soporta
            // o si la IA decide no usar herramientas, caemos al chat normal.

            if (service.chatWithTools) {
                try {
                    const result = await service.chatWithTools(aiMessages);

                    // ¿La IA quiere llamar a una función?
                    if (result.type === 'tool_call') {
                        // Procesar cada llamada a función
                        // (Por ahora solo soportamos una a la vez para mantenerlo simple)
                        const toolCall = result.toolCalls[0];

                        // =========================================================
                        // EJECUTAR LA FUNCIÓN: create_note
                        // =========================================================
                        if (toolCall.name === 'create_note') {
                            const args = toolCall.arguments as unknown as CreateNoteArgs;

                            // Crear la nota en la base de datos (igual que el endpoint /notes)
                            await databases.createDocument(
                                DATABASE_ID,
                                NOTES_ID,
                                ID.unique(),
                                {
                                    title: args.title || '',
                                    content: args.content,
                                    bgColor: args.bgColor || 'none',
                                    userId: user.$id,
                                }
                            );

                            // Crear mensaje de confirmación para el usuario
                            const confirmationMessage = `✅ ¡Nota creada exitosamente!\n\n` +
                                (args.title ? `**${args.title}**\n` : '') +
                                `${args.content}`;

                            // Guardar la respuesta del asistente en la BD
                            await databases.createDocument(
                                DATABASE_ID,
                                CHAT_MESSAGES_ID,
                                ID.unique(),
                                {
                                    conversationId,
                                    content: confirmationMessage,
                                    role: 'ASSISTANT',
                                    model: service.model,
                                }
                            );

                            // Devolver la respuesta (sin streaming, es instantánea)
                            return new Response(confirmationMessage, {
                                headers: {
                                    'Content-Type': 'text/event-stream',
                                    'Cache-Control': 'no-cache',
                                    'Connection': 'keep-alive',
                                    'X-Conversation-Id': conversationId,
                                    'X-Model-Name': service.displayName,
                                    // Header especial para indicar que se ejecutó una función
                                    'X-Function-Called': 'create_note',
                                }
                            });
                        }
                    }

                    // Si la IA respondió con texto (no tool_call), devolverlo directamente
                    if (result.type === 'text') {
                        // Guardar la respuesta
                        await databases.createDocument(
                            DATABASE_ID,
                            CHAT_MESSAGES_ID,
                            ID.unique(),
                            {
                                conversationId,
                                content: result.content,
                                role: 'ASSISTANT',
                                model: service.model,
                            }
                        );

                        return new Response(result.content, {
                            headers: {
                                'Content-Type': 'text/event-stream',
                                'Cache-Control': 'no-cache',
                                'Connection': 'keep-alive',
                                'X-Conversation-Id': conversationId,
                                'X-Model-Name': service.displayName,
                            }
                        });
                    }
                } catch (error) {
                    // Si falla chatWithTools, caer al método normal de streaming
                    console.error('chatWithTools failed, falling back to streaming:', error);
                }
            }

            // =====================================================================
            // FALLBACK: Chat normal con streaming (sin function calling)
            // =====================================================================
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
