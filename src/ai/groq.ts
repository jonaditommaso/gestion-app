import { Groq } from 'groq-sdk';
import { AIService, ChatMessage } from './types';
import { GROQ_MODEL } from './config';
import { ALL_TOOLS } from './tools';
import type { ChatCompletionTool } from 'groq-sdk/resources/chat/completions';

let groq: Groq | null = null;

function getGroqClient() {
    if (!groq) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY is missing');
        }
        groq = new Groq({ apiKey });
    }
    return groq;
}

/**
 * =============================================================================
 * GROQ SERVICE CON FUNCTION CALLING
 * =============================================================================
 *
 * Este servicio ahora tiene DOS métodos:
 *
 * 1. chat() - El método normal de streaming (sin function calling)
 *    Usado cuando ya sabemos que la IA solo debe responder con texto.
 *
 * 2. chatWithTools() - NUEVO: Método que soporta function calling
 *    La IA puede decidir si:
 *    a) Responder con texto normal
 *    b) Llamar a una función (como create_note)
 */

export const groqService: AIService = {
    model: GROQ_MODEL,
    displayName: 'Groq Moonshotai Kimi K2',

    // Método original - streaming sin tools
    async chat(messages: ChatMessage[]) {
        const groq = getGroqClient();

        const chatCompletion = await groq.chat.completions.create({
            messages,
            model: GROQ_MODEL,
            temperature: 0.6,
            max_completion_tokens: 4096,
            top_p: 1,
            stream: true,
            stop: null
        });

        return (async function* () {
            for await (const chunk of chatCompletion) {
                yield chunk.choices[0]?.delta?.content || '';
            }
        })();
    },

    /**
     * NUEVO MÉTODO: Chat con soporte para Function Calling
     * ====================================================
     *
     * ¿Cómo funciona?
     * 1. Enviamos los mensajes + la lista de herramientas (tools) a la IA
     * 2. La IA analiza el mensaje y decide:
     *    - Si necesita una herramienta → devuelve tool_calls
     *    - Si no → devuelve contenido de texto normal
     * 3. Nosotros revisamos la respuesta y actuamos según corresponda
     *
     * IMPORTANTE: Este método NO usa streaming porque necesitamos
     * la respuesta completa para saber si hay tool_calls.
     */
    async chatWithTools(messages: ChatMessage[]) {
        const response = await groq.chat.completions.create({
            messages,
            model: GROQ_MODEL,
            temperature: 0.6,
            max_completion_tokens: 4096,
            // Aquí pasamos las herramientas que la IA puede usar
            tools: ALL_TOOLS as ChatCompletionTool[],
            // "auto" = la IA decide si usar una herramienta o no
            tool_choice: "auto",
        });

        // Obtenemos la primera opción de respuesta
        const choice = response.choices[0];

        // Revisamos si la IA decidió llamar a una función
        if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
            // ¡La IA quiere usar una herramienta!
            return {
                type: 'tool_call' as const,
                toolCalls: choice.message.tool_calls.map(tc => ({
                    id: tc.id,
                    name: tc.function.name,
                    // Los argumentos vienen como string JSON, los parseamos
                    arguments: JSON.parse(tc.function.arguments)
                }))
            };
        }

        // La IA respondió con texto normal
        return {
            type: 'text' as const,
            content: choice.message.content || ''
        };
    }
}
