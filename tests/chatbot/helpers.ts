/**
 * Helpers específicos para tests del chatbot IA
 *
 * Contiene:
 * - Mocks de respuestas del endpoint /api/chat
 * - Helpers de autenticación para tests de la API
 * - Constantes de mensajes esperados
 */

import { type Page, type Route } from '@playwright/test';

// ─── Constantes ───────────────────────────────────────────────────────────────

export const CHAT_API = '**/api/chat';
export const CHAT_CONVERSATIONS_API = '**/api/chat/conversations**';

/** Auth cookie que usa sessionMiddleware */
export const AUTH_COOKIE_NAME = 'appwrite-session';

/** Mensajes esperados del sistema de permisos */
export const PERMISSION_ERROR_FRAGMENT = 'No tienes permiso';
export const UNSUPPORTED_ACTION_FRAGMENT = 'no está soportada todavía';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ChatResponse {
    type: 'text' | 'tool_call';
    content: string;
    functionCalled?: string;
    conversationId?: string;
    modelName?: string;
}

export interface MockConversation {
    $id: string;
    title: string;
    userId: string;
    $createdAt: string;
}

export interface MockChatMessage {
    $id: string;
    conversationId: string;
    content: string;
    role: 'USER' | 'ASSISTANT';
    $createdAt: string;
}

// ─── Helpers de mock para /api/chat ──────────────────────────────────────────

/**
 * Simula una respuesta de texto del chatbot (sin function calling)
 */
export async function mockChatTextResponse(
    page: Page,
    responseText: string,
    opts: { conversationId?: string; modelName?: string } = {}
): Promise<void> {
    await page.route(CHAT_API, async (route: Route) => {
        if (route.request().method() !== 'POST') {
            await route.continue();
            return;
        }
        await route.fulfill({
            status: 200,
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'X-Conversation-Id': opts.conversationId ?? 'conv-mock-001',
                'X-Model-Name': opts.modelName ?? 'Groq · Kimi K2',
            },
            body: Buffer.from(responseText),
        });
    });
}

/**
 * Simula una respuesta de acción ejecutada por el chatbot (function calling)
 */
export async function mockChatToolCallResponse(
    page: Page,
    responseText: string,
    functionCalled: string,
    opts: { conversationId?: string } = {}
): Promise<void> {
    await page.route(CHAT_API, async (route: Route) => {
        if (route.request().method() !== 'POST') {
            await route.continue();
            return;
        }
        await route.fulfill({
            status: 200,
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'X-Conversation-Id': opts.conversationId ?? 'conv-mock-001',
                'X-Model-Name': 'Groq · Kimi K2',
                'X-Function-Called': functionCalled,
            },
            body: Buffer.from(responseText),
        });
    });
}

/**
 * Simula un error 403 del chatbot (plan FREE o sin permiso)
 */
export async function mockChatForbiddenResponse(page: Page, message: string = 'Upgrade required'): Promise<void> {
    await page.route(CHAT_API, async (route: Route) => {
        if (route.request().method() !== 'POST') {
            await route.continue();
            return;
        }
        await route.fulfill({
            status: 403,
            contentType: 'application/json',
            body: JSON.stringify({ error: message }),
        });
    });
}

/**
 * Simula un error 401 del chatbot (no autenticado)
 */
export async function mockChatUnauthorizedResponse(page: Page): Promise<void> {
    await page.route(CHAT_API, async (route: Route) => {
        if (route.request().method() !== 'POST') {
            await route.continue();
            return;
        }
        await route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Unauthorized' }),
        });
    });
}

/**
 * Simula la lista de conversaciones
 */
export async function mockConversationsList(
    page: Page,
    conversations: MockConversation[] = []
): Promise<void> {
    await page.route('**/api/chat/conversations', async (route: Route) => {
        if (route.request().method() !== 'GET') {
            await route.continue();
            return;
        }
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: conversations }),
        });
    });
}

// ─── Helpers para abrir el chatbot en UI ─────────────────────────────────────

/**
 * Abre el panel del chatbot haciendo clic en el trigger de la navbar
 */
export async function openChatPanel(page: Page): Promise<void> {
    const trigger = page.locator('[data-testid="chatbot-trigger"]');
    await trigger.waitFor({ state: 'visible', timeout: 10000 });
    await trigger.click();
    // Esperar a que el panel sea visible
    await page.locator('[data-testid="chatbot-panel"]').waitFor({ state: 'visible', timeout: 5000 });
}

/**
 * Envía un mensaje desde el chat UI
 */
export async function sendChatMessage(page: Page, message: string): Promise<void> {
    const textarea = page.locator('[data-testid="chatbot-input"]');
    await textarea.waitFor({ state: 'visible', timeout: 5000 });
    await textarea.fill(message);
    await page.keyboard.press('Enter');
}
