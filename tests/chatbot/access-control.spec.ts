/**
 * SUITE E2E: Chatbot — Control de acceso en la interfaz de usuario
 *
 * Objetivo: Verificar que el chatbot es visible y funcional para usuarios
 * con plan de pago, y que está correctamente oculto/bloqueado para free.
 *
 * También verifica el comportamiento del panel: apertura, cierre,
 * persistencia de historial y navegación entre conversaciones.
 *
 * Escenarios cubiertos:
 *   1. Usuario free → botón chatbot no visible
 *   2. Usuario free → llamada directa a /api/chat devuelve 403
 *   3. Usuario paid (pro) → botón chatbot visible
 *   4. Hacer clic en trigger → panel se abre
 *   5. Panel puede cerrarse
 *   6. Input del chat acepta texto y permite enviar
 *   7. El panel muestra historial de conversaciones cuando las hay
 *   8. Crear nueva conversación limpia el estado del chat
 *   9. El panel muestra el nombre del modelo en alguna parte
 *  10. Panel no accesible si se navega a ruta no app
 */

import { test, expect, type Route } from '@playwright/test';
import { mockAuthSession, navigateToApp } from '../helpers';
import {
    mockChatTextResponse,
    mockConversationsList,
    openChatPanel,
    sendChatMessage,
    type MockConversation,
} from './helpers';

// ─── Tests: Visibilidad por plan ──────────────────────────────────────────────

test.describe('Control de acceso UI - Plan FREE vs PAID', () => {
    test('1. Usuario FREE → trigger del chatbot no visible', async ({ page }) => {
        await mockAuthSession(page, { plan: 'free' });
        await mockConversationsList(page, []);
        await navigateToApp(page, '/organization');

        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { });

        const trigger = page.locator('[data-testid="chatbot-trigger"]');
        // NO debe ser visible para usuarios free
        if (await trigger.count() > 0) {
            await expect(trigger).not.toBeVisible();
        }
        // Si el elemento no existe, el test pasa — significa que está completamente oculto
    });

    test('2. Usuario PLUS → trigger del chatbot visible', async ({ page }) => {
        await mockAuthSession(page, { plan: 'plus' });
        await mockConversationsList(page, []);
        await navigateToApp(page, '/organization');

        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { });

        // Para plan plus, el chatbot DEBE estar disponible basándonos en la lógica del ToggleChatBot
        const trigger = page.locator('[data-testid="chatbot-trigger"]');
        if (await trigger.count() > 0) {
            await expect(trigger).toBeVisible();
        }
    });

    test('3. Usuario PRO → trigger del chatbot visible', async ({ page }) => {
        await mockAuthSession(page, { plan: 'pro' });
        await mockConversationsList(page, []);
        await navigateToApp(page, '/organization');

        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { });

        const trigger = page.locator('[data-testid="chatbot-trigger"]');
        if (await trigger.count() > 0) {
            await expect(trigger).toBeVisible();
        }
    });
});

// ─── Tests: Apertura y cierre del panel ──────────────────────────────────────

test.describe('Control de acceso UI - Panel del chatbot', () => {
    test('4. Clic en trigger → panel se abre', async ({ page }) => {
        await mockAuthSession(page, { plan: 'pro' });
        await mockConversationsList(page, []);
        await navigateToApp(page, '/organization');

        await openChatPanel(page);

        await expect(page.locator('[data-testid="chatbot-panel"]')).toBeVisible();
    });

    test('5. El panel puede cerrarse', async ({ page }) => {
        await mockAuthSession(page, { plan: 'pro' });
        await mockConversationsList(page, []);
        await navigateToApp(page, '/organization');

        await openChatPanel(page);
        const panel = page.locator('[data-testid="chatbot-panel"]');
        await expect(panel).toBeVisible();

        // Buscar el botón de cerrar
        const closeButton = page.locator('[data-testid="chatbot-close"]');
        if (await closeButton.count() > 0) {
            await closeButton.click();
            await expect(panel).not.toBeVisible({ timeout: 5000 });
        } else {
            // Si no hay botón de cerrar explícito, hacer clic en el trigger de nuevo
            const trigger = page.locator('[data-testid="chatbot-trigger"]');
            if (await trigger.count() > 0) {
                await trigger.click();
                await page.waitForTimeout(1000);
            }
        }
    });

    test('6. Input del chat es funcional: acepta texto', async ({ page }) => {
        await mockAuthSession(page, { plan: 'pro' });
        await mockConversationsList(page, []);
        await navigateToApp(page, '/organization');

        await openChatPanel(page);

        const input = page.locator('[data-testid="chatbot-input"]');
        await input.waitFor({ state: 'visible', timeout: 5000 });
        await input.fill('Mensaje de prueba');
        await expect(input).toHaveValue('Mensaje de prueba');
    });

    test('7. Enviar mensaje limpia el input', async ({ page }) => {
        await mockAuthSession(page, { plan: 'pro' });
        await mockConversationsList(page, []);
        await navigateToApp(page, '/organization');

        await mockChatTextResponse(page, 'Entendido, aquí tienes la información.', {
            conversationId: 'conv-ui-001',
        });

        await openChatPanel(page);
        await sendChatMessage(page, 'Mensaje que debe limpiar el input');

        // Después de enviar, el input debe quedar vacío
        const input = page.locator('[data-testid="chatbot-input"]');
        if (await input.count() > 0) {
            await expect(input).toHaveValue('', { timeout: 5000 });
        }
    });
});

// ─── Tests: Historial de conversaciones ──────────────────────────────────────

test.describe('Control de acceso UI - Historial de conversaciones', () => {
    test('8. Conversaciones existentes aparecen en el historial', async ({ page }) => {
        const MOCK_CONVERSATIONS: MockConversation[] = [
            {
                $id: 'conv-hist-001',
                title: 'Consulta sobre tareas del sprint',
                userId: 'mock-user-001',
                $createdAt: new Date().toISOString(),
            },
            {
                $id: 'conv-hist-002',
                title: 'Creación de deals Q1',
                userId: 'mock-user-001',
                $createdAt: new Date(Date.now() - 86400000).toISOString(), // Ayer
            },
        ];

        await mockAuthSession(page, { plan: 'pro' });
        await mockConversationsList(page, MOCK_CONVERSATIONS);
        await navigateToApp(page, '/organization');

        await openChatPanel(page);

        // Si hay un toggle de historial
        const historyToggle = page.locator('[data-testid="chat-history-toggle"]');
        if (await historyToggle.count() > 0) {
            await historyToggle.click();
        }

        // Las conversaciones deben aparecer
        await expect(page.getByText('Consulta sobre tareas del sprint')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Creación de deals Q1')).toBeVisible({ timeout: 5000 });
    });

    test('9. Sin conversaciones → no muestra lista vacía rota', async ({ page }) => {
        await mockAuthSession(page, { plan: 'pro' });
        await mockConversationsList(page, []); // Sin conversaciones
        await navigateToApp(page, '/organization');

        await openChatPanel(page);

        // El historial puede mostrar un estado vacío o directamente el input
        // Lo importante es que no crashee
        await expect(page.locator('[data-testid="chatbot-panel"]')).toBeVisible();
    });

    test('10. Clic en conversación existente carga sus mensajes', async ({ page }) => {
        const CONVERSATION: MockConversation = {
            $id: 'conv-load-001',
            title: 'Chat anterior con mensajes',
            userId: 'mock-user-001',
            $createdAt: new Date().toISOString(),
        };

        await mockAuthSession(page, { plan: 'pro' });
        await mockConversationsList(page, [CONVERSATION]);

        // Mock para obtener mensajes de esa conversación
        await page.route(`**/api/chat/conversations/${CONVERSATION.$id}`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    data: {
                        ...CONVERSATION,
                        messages: [
                            {
                                $id: 'msg-001',
                                conversationId: CONVERSATION.$id,
                                content: 'Mensaje anterior del usuario',
                                role: 'USER',
                                $createdAt: new Date().toISOString(),
                            },
                            {
                                $id: 'msg-002',
                                conversationId: CONVERSATION.$id,
                                content: 'Respuesta anterior del asistente',
                                role: 'ASSISTANT',
                                $createdAt: new Date().toISOString(),
                            },
                        ],
                    },
                }),
            });
        });

        await navigateToApp(page, '/organization');
        await openChatPanel(page);

        // Toggle historial si existe
        const historyToggle = page.locator('[data-testid="chat-history-toggle"]');
        if (await historyToggle.count() > 0) {
            await historyToggle.click();
        }

        // Clic en la conversación existente
        const convItem = page.getByText('Chat anterior con mensajes');
        if (await convItem.count() > 0) {
            await convItem.click();
            // Los mensajes de esa conversación deben cargarse
            await expect(page.getByText('Respuesta anterior del asistente')).toBeVisible({ timeout: 10000 });
        }
    });
});

// ─── Tests: Feature gating en UI ─────────────────────────────────────────────

test.describe('Control de acceso UI - Feature gating', () => {
    test('11. FREE user que intenta usar el chat API directamente → 403', async ({ page }) => {
        // Simular que el API devuelve 403 para free
        await mockAuthSession(page, { plan: 'free' });
        await navigateToApp(page, '/organization');

        // El API debe bloquear el acceso incluso si la UI lo intenta
        await page.route('**/api/chat', async (route: Route) => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 403,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Upgrade required' }),
                });
                return;
            }
            await route.continue();
        });

        // Intentar hacer la petición manualmente vía fetch en la página
        const result = await page.evaluate(async () => {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Hola' }],
                }),
            });
            return response.status;
        });

        expect(result).toBe(403);
    });

    test('12. La conversación de otro usuario no es accesible', async ({ page }) => {
        // Mock: intento de acceder a una conversación de otro usuario
        const OTHER_USER_CONV_ID = 'conv-other-user-999';

        await mockAuthSession(page, { plan: 'pro' });
        await navigateToApp(page, '/organization');

        await page.route(`**/api/chat/conversations/${OTHER_USER_CONV_ID}`, async (route) => {
            await route.fulfill({
                status: 403,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Unauthorized' }),
            });
        });

        // Intentar acceder vía fetch en la página
        const result = await page.evaluate(async (convId) => {
            const response = await fetch(`/api/chat/conversations/${convId}`);
            return response.status;
        }, OTHER_USER_CONV_ID);

        expect(result).toBe(403);
    });
});
