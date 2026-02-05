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

    const response = await groq.chat.completions.create({
        messages,
        model: GROQ_MODEL,
        temperature: 0.6,
        max_completion_tokens: 4096,
        tools: ALL_TOOLS as ChatCompletionTool[],
        tool_choice: "auto",
    });

    const choice = response.choices[0];

    // ¿La IA decidió llamar a una función?
    if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
        return {
            type: 'tool_call',
            toolCalls: choice.message.tool_calls.map(tc => ({
                id: tc.id,
                name: tc.function.name,
                arguments: JSON.parse(tc.function.arguments)
            }))
        };
    }

    // Respuesta de texto normal
    return {
        type: 'text',
        content: choice.message.content || ''
    };
}
