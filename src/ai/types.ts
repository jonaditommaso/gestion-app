export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface AIService {
    model: string;
    displayName: string;
    chat: (message: ChatMessage[]) => Promise<AsyncIterable<string>>;
}

export type StreamChunk = {
    choices: Array<{
        delta?: {
            content?: string;
        };
    }>;
};