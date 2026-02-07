import { Groq } from 'groq-sdk';
import { AIService, ChatMessage } from './types';
import { GROQ_MODEL } from './config';

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
 * Servicio de Groq para CHAT CONVERSACIONAL (streaming).
 *
 * Function calling está centralizado en function-calling.ts
 * para evitar duplicación y permitir usar cualquier proveedor.
 */
export const groqService: AIService = {
    model: GROQ_MODEL,
    displayName: 'Groq Moonshotai Kimi K2',

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
    }
}
