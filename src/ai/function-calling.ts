/**
 * =============================================================================
 * FUNCTION CALLING - Servicio Centralizado
 * =============================================================================
 */

import { Groq } from 'groq-sdk';
import { ChatMessage, ChatWithToolsResult } from './types';
import { ALL_TOOLS } from './tools/index';
import { GROQ_MODEL } from './config';
import type { ChatCompletionTool } from 'groq-sdk/resources/chat/completions';

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

const REPLY_TOOL: ChatCompletionTool = {
    type: 'function',
    function: {
        name: 'reply',
        description: 'Use this function to send a conversational text response when no platform action is needed (greetings, general questions, help). Do NOT use this for listing, querying, or modifying platform data.',
        parameters: {
            type: 'object',
            properties: {
                content: {
                    type: 'string',
                    description: 'The response text to show to the user.',
                },
            },
            required: ['content'],
        },
    },
};

const SYSTEM_PROMPT = `You are an assistant for a business management platform. Always respond by calling a function — never with free text.

Modules: Pipeline CRM (deals/ventas/tratos/oportunidades/pipeline) → query_deals, create_deal, update_deal, delete_deal, add_deal_comment, manage_deal_assignees, bulk_update_deals, query_deal_goals. Tasks (tareas/compiti/tickets) → query_tasks, create_task, update_task, delete_task, add_task_comment, add_checklist_item, assign_task_member, bulk_move_tasks, archive_task. Billing (facturas/fatture/invoices/ingresos/gastos) → query_billing_operations, create_billing_operation, update_billing_operation, delete_billing_operation, manage_billing_categories. Notes (notas/note) → create_note, update_note, delete_note. Messages (mensajes) → send_message.

Rules:
- List/query/filter/show data → call query_* immediately, no clarification.
- Create/update/delete → call the appropriate function only when you have all required fields. If required fields are missing, call reply(content) to ask the user for them.
- CRITICAL: reply() is ONLY for asking questions or conversational responses. NEVER use reply() to simulate, confirm, or describe an action as if it was completed. If you must create something, call the actual function.
- NEVER invent or assume values for required fields (like company, amount, currency). If not provided by the user, ask via reply().
- Missing required fields for create_deal: company, amount, currency. Ask for all missing ones in a single reply.
- Missing required fields for create_billing_operation: amount, type (income/expense). Ask if missing.
- Conversational (greetings, general questions) → call reply(content).
- NEVER say "I don't have access" — you ARE the system. Data is always here.
- NEVER ask which app/platform — always this one.
- NEVER suggest external tools (GitHub, Jira, Linear, Notion, Slack, etc.) — this platform IS where tasks, deals, notes and messages live.
- create_task: "workspace" means the internal workspace of this platform, NOT an external tool. When the user says "crea una task en el workspace" or "crea una tarea", always call create_task immediately. The title is required; infer it from context if not explicit. workspaceName is optional — only pass it if the user explicitly names one.
- query_billing_operations: pass source='archived' or 'drafts' when user asks for those; default is 'active'.
- update_task: use increasePriority/decreasePriority for relative priority; priority:1-5 for absolute. assignToSelf:true for self-assign.
- update_deal: use increasePriority/decreasePriority for relative priority changes (e.g. "subir prioridad", "más importante"). For absolute priority: 1=Baja, 2=Media, 3=Alta. NEVER invert this scale.
- bulk_update_deals: only for multiple deals; use update_deal for a single one.
- query_deals: CRM/pipeline board names (e.g. "Jona Ventas Q1", "mi CRM de X", "el pipeline de Y") are NOT deal titles or companies — NEVER pass them as the 'search' parameter. They just indicate the user is talking about their pipeline. Call query_deals with NO filters (or only explicit filters like status/outcome) to return all deals. Only use 'search' if the user explicitly names a deal title or company.`;

export async function chatWithTools(messages: ChatMessage[], allowedTools?: ChatCompletionTool[]): Promise<ChatWithToolsResult> {
    const groq = getGroqClient();
    const allTools = [...(allowedTools ?? ALL_TOOLS as ChatCompletionTool[]), REPLY_TOOL];

    // Limit history to last 6 messages to stay within model token limits
    const recentMessages = messages.slice(-6);

    const messagesWithSystem: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...recentMessages,
    ];

    let response;
    try {
        response = await groq.chat.completions.create({
            messages: messagesWithSystem,
            model: GROQ_MODEL,
            temperature: 0.1,
            max_completion_tokens: 2048,
            tools: allTools,
            tool_choice: 'required',
        });
    } catch (err: unknown) {
        // When the model generates text instead of calling a function,
        // Groq returns 400 tool_use_failed with the text in failed_generation.
        // Extract it and return as a normal text response.
        if (
            err instanceof Groq.APIError &&
            err.status === 400 &&
            err.error &&
            typeof err.error === 'object' &&
            'failed_generation' in err.error &&
            typeof (err.error as Record<string, unknown>).failed_generation === 'string'
        ) {
            const text = (err.error as Record<string, unknown>).failed_generation as string;
            return { type: 'text', content: text };
        }
        throw err;
    }

    const choice = response.choices[0];

    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
        const tc = choice.message.tool_calls[0];
        const args = JSON.parse(tc.function.arguments);

        if (tc.function.name === 'reply') {
            return {
                type: 'text',
                content: (args as { content: string }).content,
            };
        }

        return {
            type: 'tool_call',
            toolCalls: choice.message.tool_calls.map(t => ({
                id: t.id,
                name: t.function.name,
                arguments: JSON.parse(t.function.arguments),
            })),
        };
    }

    return {
        type: 'text',
        content: choice.message.content || '',
    };
}