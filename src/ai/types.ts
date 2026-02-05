export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

/**
 * Resultado cuando la IA llama a una función (tool)
 */
export interface ToolCallResult {
    type: 'tool_call';
    toolCalls: Array<{
        id: string;
        name: string;
        arguments: Record<string, unknown>;
    }>;
}

/**
 * Resultado cuando la IA responde con texto normal
 */
export interface TextResult {
    type: 'text';
    content: string;
}

/**
 * Tipo unión para el resultado de chatWithTools
 */
export type ChatWithToolsResult = ToolCallResult | TextResult;

/**
 * Servicio de IA para chat conversacional (streaming).
 * Function calling está separado en function-calling.ts
 */
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
