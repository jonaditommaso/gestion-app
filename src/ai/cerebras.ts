import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { AIService, ChatMessage, StreamChunk } from './types';
import { CEREBRAS_MODEL } from './config';

// const cerebras = new Cerebras();
// Initialize Cerebras client lazily to avoid unnecessary instantiation (e.g., when API key is missing)
let cerebras: Cerebras | null = null;

function getCerebrasClient() {
    if (!cerebras) {
        const apiKey = process.env.CEREBRAS_API_KEY;
        if (!apiKey) {
            throw new Error('CEREBRAS_API_KEY is missing');
        }
        cerebras = new Cerebras({ apiKey });
    }
    return cerebras;
}

export const cerebrasService: AIService = {
    model: CEREBRAS_MODEL,
    displayName: 'Cerebras Zai-GLM 4.7',
    async chat(messages: ChatMessage[]) {
        const cerebras = getCerebrasClient();

        const formattedMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        const stream = await cerebras.chat.completions.create({
            messages: formattedMessages,
            model: CEREBRAS_MODEL,
            stream: true,
            max_completion_tokens: 65000,
            temperature: 1,
            top_p: 0.95
        });

        return (async function* () {
            for await (const chunk of stream) {
                const content = (chunk as StreamChunk).choices?.[0]?.delta?.content;
                if (content) yield content;
            }
        })();
    }
}