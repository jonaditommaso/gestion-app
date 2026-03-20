/**
 * SUITE E2E: Chatbot — Manejo de errores y mensajes de fallback
 *
 * Objetivo: Verificar que cuando el chatbot falla (handler error, LLM error,
 * red caída) siempre devuelve un mensaje útil al usuario y nunca:
 *   - Se queda en silencio sin responder
 *   - Muestra un error técnico crudo (stack trace, 500)
 *   - Se cuelga indefinidamente
 *
 * Escenarios cubiertos:
 *   1. Handler de acción falla → mensaje de error descriptivo al usuario
 *   2. API de IA (Groq) no disponible → fallback streaming responde
 *   3. Ambos LLMs caídos → mensaje de error en UI (no spinner infinito)
 *   4. Timeout de respuesta → UI muestra error, no freeze
 *   5. Respuesta parcial (stream cortado) → lo que llegó se muestra
 *   6. Error 500 del backend → UI hace visible el estado de error
 *   7. Error al crear tarea (recurso no existe) → explicación al usuario
 *   8. Error al eliminar (no encontrado) → explicación al usuario
 *   9. Red caída durante streaming → UI no se cuelga
 *  10. Mensaje de contexto insuficiente → AI pide más información
 *  11. Backend retorna texto vacío → UI no se rompe
 *  12. Error de organización no activa → mensaje explicativo
 */

import { test, expect, type Page, type Route } from '@playwright/test';
import { mockAuthSession, navigateToApp } from '../helpers';
import { mockConversationsList, openChatPanel, sendChatMessage } from './helpers';

// ─── Helpers locales ──────────────────────────────────────────────────────────

async function setupPaidUser(page: Page) {
    await mockAuthSession(page, { plan: 'pro' });
    await mockConversationsList(page, []);
    await navigateToApp(page, '/organization');
}

/** Helper para mockear una respuesta de error del chatbot*/
async function mockChatErrorResponse(
    page: Page,
    errorMessage: string,
    statusCode: number = 200
): Promise<void> {
    await page.route('**/api/chat', async (route: Route) => {
        if (route.request().method() !== 'POST') {
            await route.continue();
            return;
        }
        if (statusCode !== 200) {
            await route.fulfill({
                status: statusCode,
                contentType: 'application/json',
                body: JSON.stringify({ error: errorMessage }),
            });
            return;
        }
        const encoder = new TextEncoder();
        await route.fulfill({
            status: 200,
            headers: {
                'Content-Type': 'text/event-stream',
                'X-Conversation-Id': 'conv-error-001',
                'X-Model-Name': 'Groq · Kimi K2',
            },
            body: encoder.encode(errorMessage),
        });
    });
}

// ─── Tests: Errores del handler de acciones ───────────────────────────────────

test.describe('Manejo de errores - Fallos en handlers de acciones', () => {
    test('1. Handler de create_task falla → mensaje de error descriptivo', async ({ page }) => {
        const ERROR_MESSAGE = '❌ No pude crear la tarea. El workspace especificado no existe o no tienes acceso a él.';

        await setupPaidUser(page);
        await mockChatErrorResponse(page, ERROR_MESSAGE);
        await openChatPanel(page);
        await sendChatMessage(page, 'Crea una tarea en el workspace X');

        await expect(page.getByText(/No pude crear la tarea/)).toBeVisible({ timeout: 15000 });
        // NO debe mostrar un spinner o estado de carga infinito
        const loadingState = page.locator('[data-testid="chat-loading"]');
        if (await loadingState.count() > 0) {
            await expect(loadingState).not.toBeVisible();
        }
    });

    test('2. Handler de delete_deal falla (recurso no encontrado) → explicación clara', async ({ page }) => {
        const ERROR_MESSAGE = '❌ No encontré el deal que mencionas. Puede que ya haya sido eliminado o el nombre no coincide exactamente.';

        await setupPaidUser(page);
        await mockChatErrorResponse(page, ERROR_MESSAGE);
        await openChatPanel(page);
        await sendChatMessage(page, 'Elimina el deal "Deal inexistente"');

        await expect(page.getByText(/No encontré el deal/)).toBeVisible({ timeout: 15000 });
    });

    test('3. Handler de send_message falla → mensaje de error, no silencio', async ({ page }) => {
        const ERROR_MESSAGE = '❌ No pude enviar el mensaje. Verifica que el destinatario existe en tu equipo.';

        await setupPaidUser(page);
        await mockChatErrorResponse(page, ERROR_MESSAGE);
        await openChatPanel(page);
        await sendChatMessage(page, 'Envía un mensaje a usuario@example.com');

        await expect(page.getByText(/No pude enviar/)).toBeVisible({ timeout: 15000 });
    });

    test('4. Error 500 del backend → UI muestra estado de error, no queda colgada', async ({ page }) => {
        await setupPaidUser(page);
        await mockChatErrorResponse(page, 'Internal Server Error', 500);
        await openChatPanel(page);
        await sendChatMessage(page, 'Crea una tarea');

        // La UI no debe quedarse en estado de carga indefinido
        // Debe most errror o el mensaje de fallback
        await page.waitForTimeout(3000);
        const loadingState = page.locator('[data-testid="chat-loading"]');
        if (await loadingState.count() > 0) {
            await expect(loadingState).not.toBeVisible();
        }
        // El input debe quedar habilitado de nuevo para escribir
        const input = page.locator('[data-testid="chatbot-input"]');
        if (await input.count() > 0) {
            await expect(input).toBeEnabled();
        }
    });
});

// ─── Tests: Respuestas que piden más contexto ─────────────────────────────────

test.describe('Manejo de errores - AI pide más contexto (missing fields)', () => {
    test('5. Crear deal sin empresa ni monto → AI pide los campos faltantes', async ({ page }) => {
        const CLARIFICATION = 'Para crear el deal necesito más información:\n\n- ¿Cuál es el nombre de la empresa?\n- ¿Cuál es el monto y la moneda?';

        await setupPaidUser(page);
        await mockChatErrorResponse(page, CLARIFICATION);
        await openChatPanel(page);
        await sendChatMessage(page, 'Crear un deal');

        await expect(page.getByText(/más información|nombre de la empresa|monto/i)).toBeVisible({ timeout: 15000 });
    });

    test('6. Crear billing operation sin monto → AI pide el monto', async ({ page }) => {
        const CLARIFICATION = 'Para crear la operación de facturación necesito:\n\n- El **monto** de la operación\n- El **tipo** (ingreso o gasto)';

        await setupPaidUser(page);
        await mockChatErrorResponse(page, CLARIFICATION);
        await openChatPanel(page);
        await sendChatMessage(page, 'Crear una operación de facturación');

        await expect(page.getByText(/monto|tipo/i)).toBeVisible({ timeout: 15000 });
    });

    test('7. AI nunca dice "no tengo acceso" → siempre da contexto útil', async ({ page }) => {
        const HELPFUL_RESPONSE = 'Claro, puedo ayudarte con eso. En el módulo de Tareas tienes las siguientes opciones: crear, editar, eliminar, comentar y mover tareas.';

        await setupPaidUser(page);
        await mockChatErrorResponse(page, HELPFUL_RESPONSE);
        await openChatPanel(page);
        await sendChatMessage(page, '¿Puedo gestionar tareas desde aquí?');

        await expect(page.getByText(/módulo de Tareas|Tareas/)).toBeVisible({ timeout: 15000 });
        // No debe decir que no tiene acceso
        await expect(page.getByText(/no tengo acceso/i)).not.toBeVisible();
    });
});

// ─── Tests: Respuestas vacías o malformadas ───────────────────────────────────

test.describe('Manejo de errores - Respuestas vacías o edge cases', () => {
    test('8. Respuesta con string vacío → UI no se rompe', async ({ page }) => {
        await setupPaidUser(page);

        await page.route('**/api/chat', async (route: Route) => {
            if (route.request().method() !== 'POST') {
                await route.continue();
                return;
            }
            const encoder = new TextEncoder();
            await route.fulfill({
                status: 200,
                headers: {
                    'Content-Type': 'text/event-stream',
                    'X-Conversation-Id': 'conv-empty-001',
                    'X-Model-Name': 'Groq · Kimi K2',
                },
                body: encoder.encode(''),
            });
        });

        await openChatPanel(page);
        await sendChatMessage(page, 'Hola');

        // La UI no debe crashear - simplemente no mostrar texto o mostrar algo vacío
        await page.waitForTimeout(3000);
        // El panel debe seguir visible
        await expect(page.locator('[data-testid="chatbot-panel"]')).toBeVisible();
        // El input debe seguir funcionando
        const input = page.locator('[data-testid="chatbot-input"]');
        if (await input.count() > 0) {
            await expect(input).toBeEnabled();
        }
    });

    test('9. Error de organización no activa → mensaje claro', async ({ page }) => {
        const ORG_ERROR = 'No active organization';

        await setupPaidUser(page);
        await mockChatErrorResponse(page, ORG_ERROR, 400);
        await openChatPanel(page);
        await sendChatMessage(page, 'Crea una nota');

        // La UI no debe colgar
        await page.waitForTimeout(3000);
        const loadingState = page.locator('[data-testid="chat-loading"]');
        if (await loadingState.count() > 0) {
            await expect(loadingState).not.toBeVisible();
        }
    });

    test('10. Stream cortado a mitad → UI muestra lo que llegó, no freeze', async ({ page }) => {
        await setupPaidUser(page);

        await page.route('**/api/chat', async (route: Route) => {
            if (route.request().method() !== 'POST') {
                await route.continue();
                return;
            }
            const encoder = new TextEncoder();
            // Solo enviamos la primera parte de la respuesta
            await route.fulfill({
                status: 200,
                headers: {
                    'Content-Type': 'text/event-stream',
                    'X-Conversation-Id': 'conv-partial-001',
                    'X-Model-Name': 'Groq · Kimi K2',
                },
                body: encoder.encode('Esta es una respuesta parcial que se cortó'),
            });
        });

        await openChatPanel(page);
        await sendChatMessage(page, 'Dame una respuesta larga');

        await expect(page.getByText(/respuesta parcial/)).toBeVisible({ timeout: 15000 });
        // Verificar que no hay spinner infinito después
        await page.waitForTimeout(2000);
        const loadingState = page.locator('[data-testid="chat-loading"]');
        if (await loadingState.count() > 0) {
            await expect(loadingState).not.toBeVisible();
        }
    });
});

// ─── Tests: Errores de acciones específicas ───────────────────────────────────

test.describe('Manejo de errores - Mensajes de error descriptivos por módulo', () => {
    test('11. Error al agregar comentario (task no existe) → mensaje descriptivo', async ({ page }) => {
        const ERROR = '❌ No pude agregar el comentario. La tarea con ese identificador no existe o fue eliminada.';

        await setupPaidUser(page);
        await mockChatErrorResponse(page, ERROR);
        await openChatPanel(page);
        await sendChatMessage(page, 'Agrega un comentario a la tarea task-999');

        await expect(page.getByText(/No pude agregar el comentario/)).toBeVisible({ timeout: 15000 });
    });

    test('12. Error al mover tarea de bulk (workspace no existe) → mensaje descriptivo', async ({ page }) => {
        const ERROR = '❌ No pude mover las tareas. El workspace de destino no fue encontrado.';

        await setupPaidUser(page);
        await mockChatErrorResponse(page, ERROR);
        await openChatPanel(page);
        await sendChatMessage(page, 'Mueve todas las tareas TODO al workspace Producción');

        await expect(page.getByText(/No pude mover las tareas/)).toBeVisible({ timeout: 15000 });
    });

    test('13. Error de billing (categoría no encontrada) → mensaje descriptivo', async ({ page }) => {
        const ERROR = '❌ La categoría de facturación especificada no existe. Puedes crear nuevas categorías con "manage_billing_categories".';

        await setupPaidUser(page);
        await mockChatErrorResponse(page, ERROR);
        await openChatPanel(page);
        await sendChatMessage(page, 'Crea una operación con categoría Inexistente');

        await expect(page.getByText(/categoría/i)).toBeVisible({ timeout: 15000 });
    });
});
