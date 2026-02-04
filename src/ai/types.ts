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

export interface AIService {
    model: string;
    displayName: string;
    chat: (message: ChatMessage[]) => Promise<AsyncIterable<string>>;
    // Nuevo método opcional para function calling
    chatWithTools?: (messages: ChatMessage[]) => Promise<ChatWithToolsResult>;
}

export type StreamChunk = {
    choices: Array<{
        delta?: {
            content?: string;
        };
    }>;
};
