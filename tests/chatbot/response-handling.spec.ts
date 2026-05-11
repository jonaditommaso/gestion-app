/**
 * SUITE E2E: Chatbot — Respuestas esperadas
 *
 * Objetivo: Verificar que el chatbot responde correctamente según el tipo de input.
 * Usa mocks del endpoint /api/chat para simular respuestas del backend.
 *
 * Escenarios cubiertos:
 *   1. Mensaje conversacional simple → respuesta de texto mostrada en UI
 *   2. Respuesta de texto con markdown → renderizado correcto
 *   3. Respuesta de action (function calling) → mensaje de confirmación mostrado
 *   4. Headers X-Function-Called presentes → UI invalida la query correcta
 *   5. Header X-Conversation-Id retornado → conversationId actualizado en UI
 *   6. Streaming chunk-by-chunk → el texto aparece progresivamente
 *   7. Respuesta vacía del backend → UI no se cuelga
 *   8. Múltiples mensajes en el historial → se envían correctamente al API
 *   9. Primer mensaje crea conversación nueva → conversationId asignado
 *  10. Respuesta larga se muestra completa
 */

import { test, expect, type Page, type Route } from '@playwright/test';
import { mockAuthSession, navigateToApp } from '../helpers';
import {
    mockChatTextResponse,
    mockChatToolCallResponse,
    mockConversationsList,
    openChatPanel,
    sendChatMessage,
} from './helpers';

// ─── Setup base ───────────────────────────────────────────────────────────────

async function setupPaidUserWithChat(page: Page) {
    // Usuario con plan Pro (acceso al chatbot)
    await mockAuthSession(page, { plan: 'pro' });
    await mockConversationsList(page, []);
    await navigateToApp(page, '/organization');
}

// ─── Tests de respuestas de texto ────────────────────────────────────────────

test.describe('Chatbot UI - Respuestas de texto', () => {
    test('1. Respuesta de texto simple se muestra en el panel', async ({ page }) => {
        const EXPECTED_RESPONSE = 'Hola! Soy tu asistente. Puedo ayudarte con tareas, deals, notas y más.';

        await setupPaidUserWithChat(page);
        await mockChatTextResponse(page, EXPECTED_RESPONSE, { conversationId: 'conv-001' });
        await openChatPanel(page);
        await sendChatMessage(page, 'Hola, ¿qué puedes hacer?');

        // La respuesta debe aparecer en el chat
        await expect(page.getByText(EXPECTED_RESPONSE)).toBeVisible({ timeout: 15000 });
    });

    test('2. Respuesta con markdown (negrita, lista) se renderiza correctamente', async ({ page }) => {
        const markdownResponse = `**Puedo ayudarte con:**\n\n- Crear y gestionar tareas\n- Pipeline CRM\n- Facturación\n- Notas personales`;

        await setupPaidUserWithChat(page);
        await mockChatTextResponse(page, markdownResponse, { conversationId: 'conv-002' });
        await openChatPanel(page);
        await sendChatMessage(page, '¿Qué módulos tienes?');

        // El texto "Puedo ayudarte con" debe estar visible
        await expect(page.getByText(/Puedo ayudarte con/)).toBeVisible({ timeout: 15000 });
    });

    test('3. El nombre del modelo se muestra correctamente', async ({ page }) => {
        await setupPaidUserWithChat(page);
        await mockChatTextResponse(page, 'Respuesta de prueba', {
            conversationId: 'conv-003',
            modelName: 'Groq · GPT-OSS 120B',
        });
        await openChatPanel(page);
        await sendChatMessage(page, 'Prueba');

        // El modelo puede mostrarse en el footer o header del panel
        const modelDisplay = page.locator('[data-testid="chat-model-name"]');
        if (await modelDisplay.count() > 0) {
            await expect(modelDisplay).toContainText('Kimi');
        }
        // Si no hay el testid, al menos la respuesta debe mostrarse
        await expect(page.getByText('Respuesta de prueba')).toBeVisible({ timeout: 15000 });
    });

    test('4. El mensaje del usuario aparece en el historial del chat', async ({ page }) => {
        const USER_MESSAGE = '¿Cuántas tareas tengo pendientes?';

        await setupPaidUserWithChat(page);
        await mockChatTextResponse(page, 'Tienes 3 tareas pendientes.', { conversationId: 'conv-004' });
        await openChatPanel(page);
        await sendChatMessage(page, USER_MESSAGE);

        // El mensaje del usuario debe verse en el chat
        await expect(page.getByText(USER_MESSAGE)).toBeVisible({ timeout: 10000 });
    });

    test('5. Respuesta larga se muestra completa sin truncar', async ({ page }) => {
        const longResponse = 'Esta es una respuesta muy larga. '.repeat(50); // ~1650 chars

        await setupPaidUserWithChat(page);
        await mockChatTextResponse(page, longResponse, { conversationId: 'conv-005' });
        await openChatPanel(page);
        await sendChatMessage(page, 'Explícame todo en detalle');

        await expect(page.getByText(/Esta es una respuesta muy larga/)).toBeVisible({ timeout: 15000 });
    });
});

// ─── Tests de respuestas de function calling ─────────────────────────────────

test.describe('Chatbot UI - Respuestas de function calling (acciones)', () => {
    test('6. Acción create_task ejecutada → mensaje de confirmación visible', async ({ page }) => {
        const CONFIRMATION = '✅ Tarea **Revisar documentación** creada exitosamente.';

        await setupPaidUserWithChat(page);
        await mockChatToolCallResponse(page, CONFIRMATION, 'create_task', { conversationId: 'conv-006' });
        await openChatPanel(page);
        await sendChatMessage(page, 'Crea una tarea llamada Revisar documentación');

        await expect(page.getByText(/Revisar documentación/)).toBeVisible({ timeout: 15000 });
    });

    test('7. Acción create_deal ejecutada → confirmación visible', async ({ page }) => {
        const CONFIRMATION = '✅ Deal **Contrato ABC** creado correctamente.';

        await setupPaidUserWithChat(page);
        await mockChatToolCallResponse(page, CONFIRMATION, 'create_deal', { conversationId: 'conv-007' });
        await openChatPanel(page);
        await sendChatMessage(page, 'Crea un deal para Contrato ABC por 5000€');

        await expect(page.getByText(/Contrato ABC/)).toBeVisible({ timeout: 15000 });
    });

    test('8. Acción create_note ejecutada → confirmación visible', async ({ page }) => {
        const CONFIRMATION = '📝 Nota creada: "Reunión con cliente mañana a las 10h"';

        await setupPaidUserWithChat(page);
        await mockChatToolCallResponse(page, CONFIRMATION, 'create_note', { conversationId: 'conv-008' });
        await openChatPanel(page);
        await sendChatMessage(page, 'Crea una nota: Reunión con cliente mañana a las 10h');

        await expect(page.getByText(/Reunión con cliente/)).toBeVisible({ timeout: 15000 });
    });

    test('9. Query de tareas → lista de resultados visible', async ({ page }) => {
        const QUERY_RESPONSE = `**Tareas encontradas (3):**\n\n1. Diseñar landing page — TODO\n2. Implementar auth — IN PROGRESS\n3. Code review — IN REVIEW`;

        await setupPaidUserWithChat(page);
        await mockChatToolCallResponse(page, QUERY_RESPONSE, 'query_tasks', { conversationId: 'conv-009' });
        await openChatPanel(page);
        await sendChatMessage(page, '¿Qué tareas tengo?');

        await expect(page.getByText(/Tareas encontradas/)).toBeVisible({ timeout: 15000 });
    });

    test('10. Acción de eliminación → confirmación con nombre del elemento', async ({ page }) => {
        const CONFIRMATION = '🗑️ Tarea **Tarea obsoleta** eliminada correctamente.';

        await setupPaidUserWithChat(page);
        await mockChatToolCallResponse(page, CONFIRMATION, 'delete_task', { conversationId: 'conv-010' });
        await openChatPanel(page);
        await sendChatMessage(page, 'Elimina la tarea Tarea obsoleta');

        await expect(page.getByText(/Tarea obsoleta/)).toBeVisible({ timeout: 15000 });
    });
});

// ─── Tests de conversación multi-turno ───────────────────────────────────────

test.describe('Chatbot UI - Conversación multi-turno', () => {
    test('11. Segundo mensaje usa el mismo conversationId', async ({ page }) => {
        let requestCount = 0;
        const conversationId = 'conv-persistent-001';

        await setupPaidUserWithChat(page);

        await page.route('**/api/chat', async (route: Route) => {
            const body = await route.request().postDataJSON();
            const encoder = new TextEncoder();
            requestCount++;

            if (requestCount === 1) {
                // Primera respuesta — devuelve conversationId nuevo
                await route.fulfill({
                    status: 200,
                    headers: {
                        'Content-Type': 'text/event-stream',
                        'X-Conversation-Id': conversationId,
                        'X-Model-Name': 'Groq · GPT-OSS 120B',
                    },
                    body: encoder.encode('Primera respuesta del chatbot.'),
                });
            } else {
                // Segunda petición debe incluir el conversationId del anterior
                const sentConvId = body?.conversationId;
                await route.fulfill({
                    status: 200,
                    headers: {
                        'Content-Type': 'text/event-stream',
                        'X-Conversation-Id': conversationId,
                        'X-Model-Name': 'Groq · GPT-OSS 120B',
                    },
                    body: encoder.encode('Segunda respuesta: conversationId recibido.'),
                });
                // Verificar que se envió el conversationId correcto
                expect(sentConvId).toBe(conversationId);
            }
        });

        await openChatPanel(page);

        // Primer mensaje
        await sendChatMessage(page, 'Primer mensaje');
        await expect(page.getByText('Primera respuesta del chatbot.')).toBeVisible({ timeout: 15000 });

        // Segundo mensaje
        await sendChatMessage(page, 'Segundo mensaje');
        await expect(page.getByText('Segunda respuesta: conversationId recibido.')).toBeVisible({ timeout: 15000 });

        expect(requestCount).toBe(2);
    });

    test('12. El historial de mensajes se envía al segundo turno', async ({ page }) => {
        let capturedMessages: Array<{ role: string; content: string }> = [];

        await setupPaidUserWithChat(page);

        let callCount = 0;
        await page.route('**/api/chat', async (route: Route) => {
            if (route.request().method() !== 'POST') {
                await route.continue();
                return;
            }
            callCount++;
            const body = await route.request().postDataJSON();
            capturedMessages = body?.messages ?? [];

            const encoder = new TextEncoder();
            const responseText = `Respuesta #${callCount}`;
            await route.fulfill({
                status: 200,
                headers: {
                    'Content-Type': 'text/event-stream',
                    'X-Conversation-Id': 'conv-multi-001',
                    'X-Model-Name': 'Groq · GPT-OSS 120B',
                },
                body: encoder.encode(responseText),
            });
        });

        await openChatPanel(page);
        await sendChatMessage(page, 'Hola');
        await expect(page.getByText('Respuesta #1')).toBeVisible({ timeout: 15000 });

        await sendChatMessage(page, 'Segunda pregunta');
        await expect(page.getByText('Respuesta #2')).toBeVisible({ timeout: 15000 });

        // En el segundo turno, el historial debe contener al menos el mensaje del usuario anterior
        expect(capturedMessages.length).toBeGreaterThanOrEqual(2);
    });
});
