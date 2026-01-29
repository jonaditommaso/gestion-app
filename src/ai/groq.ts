import { Groq } from 'groq-sdk';
import { AIService, ChatMessage } from './types';
import { GROQ_MODEL } from './config';

const groq = new Groq();

export const groqService: AIService = {
    model: GROQ_MODEL,
    displayName: 'Groq Moonshotai Kimi K2',
    async chat(messages: ChatMessage[]) {
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
