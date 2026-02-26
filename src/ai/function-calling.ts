/**
 * =============================================================================
 * FUNCTION CALLING - Servicio Centralizado
 * =============================================================================
 *
 * Este módulo centraliza la lógica de function calling para que:
 * 1. Sea reutilizable con cualquier proveedor (Groq, Cerebras, OpenAI, etc.)
 * 2. Esté separado del chat conversacional
 * 3. Use una implementación compartida que cualquier servicio puede usar
 *
 * IMPORTANTE: La función chatWithTools está aquí para evitar duplicar
 * código en cada servicio de IA. Usa el SDK de Groq internamente porque
 * es el que mejor soporte tiene para tools, pero esto es transparente
 * para quien lo usa.
 */

import { Groq } from 'groq-sdk';
import { ChatMessage, ChatWithToolsResult } from './types';
import { ALL_TOOLS } from './tools/index';
import { GROQ_MODEL } from './config';
import type { ChatCompletionTool } from 'groq-sdk/resources/chat/completions';

// Cliente de Groq para function calling (lazy initialization)
let groqClient: Groq | null = null;

function getGroqClient(): Groq {
    if (!groqClient) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY is required for function calling');
        }
        groqClient = new Groq({ apiKey });
    }
    return groqClient;
}

/**
 * Ejecuta chat con soporte para function calling.
 *
 * Esta función está centralizada aquí para:
 * - Evitar duplicar código en cada servicio de IA
 * - Poder cambiar el proveedor de function calling sin tocar otros archivos
 * - Mantener separada la lógica de "entender acciones" del "chat conversacional"
 *
 * @param messages - Mensajes de la conversación
 * @returns Resultado con tipo 'tool_call' o 'text'
 */
export async function chatWithTools(messages: ChatMessage[]): Promise<ChatWithToolsResult> {
    const groq = getGroqClient();

    console.log('[FUNCTION_CALLING] Request:', {
        messageCount: messages.length,
        lastMessage: messages[messages.length - 1],
        toolsCount: ALL_TOOLS.length,
        tools: ALL_TOOLS.map(t => t.function.name),
    });

    // Agregar un mensaje de sistema que fuerce el uso de herramientas
    const messagesWithSystem: ChatMessage[] = [
        {
            role: 'system',
            content: `Eres un asistente que SIEMPRE debe usar las funciones disponibles cuando el usuario lo solicite. NUNCA simules o finjas ejecutar una acción - DEBES llamar a la función correspondiente.

            Reglas por función:
            - create_note: si el usuario pide crear, guardar o agregar una nota o recordatorio.
            - update_note: si el usuario pide modificar, editar, pinear/anclar, despinear, cambiar color, agregar renglones/líneas, activar gradiente, hacer global una nota ya anclada, quitar globalización o cualquier cambio sobre una nota existente.
            - delete_note: si el usuario pide eliminar, borrar o quitar una nota existente.
            - send_message: si el usuario pide enviar un mensaje a un compañero del equipo. SIEMPRE llama a esta función con el nombre tal como lo escribió el usuario, aunque sea un apodo, nombre parcial o en minúsculas. NUNCA preguntes si el nombre es válido antes de llamar a la función — el backend se encarga de resolver el nombre.

            NO respondas con texto simulando que lo hiciste. EJECUTA la función correspondiente.`
        },
        ...messages
    ];

    const response = await groq.chat.completions.create({
        messages: messagesWithSystem,
        model: GROQ_MODEL,
        temperature: 0.2,
        max_completion_tokens: 4096,
        tools: ALL_TOOLS as ChatCompletionTool[],
        tool_choice: "auto",
    });

    const choice = response.choices[0];

    console.log('[FUNCTION_CALLING] Response:', {
        finishReason: choice.finish_reason,
        hasToolCalls: !!choice.message.tool_calls,
        toolCallsCount: choice.message.tool_calls?.length || 0,
        messageContent: choice.message.content?.substring(0, 200),
    });

    // ¿La IA decidió llamar a una función?
    if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
        const toolCalls = choice.message.tool_calls.map(tc => ({
            id: tc.id,
            name: tc.function.name,
            arguments: JSON.parse(tc.function.arguments)
        }));

        console.log('[FUNCTION_CALLING] Tool calls detected:', toolCalls);

        return {
            type: 'tool_call',
            toolCalls
        };
    }

    // Respuesta de texto normal
    console.log('[FUNCTION_CALLING] Text response (no tool call)');
    return {
        type: 'text',
        content: choice.message.content || ''
    };
}
