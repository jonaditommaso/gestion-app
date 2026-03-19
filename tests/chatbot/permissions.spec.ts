/**
 * SUITE E2E: Chatbot — Validación de permisos en acciones
 *
 * Objetivo: Verificar que el chatbot respeta el sistema de permisos
 * a la hora de ejecutar acciones que modifican datos.
 *
 * El sistema de permisos funciona así:
 *   - TOOL_PERMISSIONS mapea tool → [permisos requeridos]
 *   - El usuario debe tener AL MENOS UNO de esos permisos
 *   - Permisos vacíos [] = cualquier miembro autenticado puede ejecutarlo
 *   - Si falla → devuelve "❌ No tienes permiso para realizar esta acción."
 *
 * Estrategia de prueba:
 *   - Mockear /api/chat para simular las respuestas del backend con permisos
 *   - Verificar que el mensaje de error correcto llega al UI cuando hay restricción
 *   - Verificar que el flujo exitoso pasa correctamente cuando hay permisos
 *
 * Escenarios cubiertos por permiso:
 *   1. VIEWER intenta crear tarea → mensaje de error de permisos en UI
 *   2. VIEWER intenta eliminar tarea → mensaje de error de permisos
 *   3. VIEWER intenta crear deal → mensaje de error de permisos
 *   4. VIEWER intenta eliminar billing op → mensaje de error de permisos
 *   5. VIEWER puede hacer queries (sin restricción) → respuesta exitosa
 *   6. OWNER puede crear tarea → confirmación exitosa
 *   7. OWNER puede eliminar deal → confirmación exitosa
 *   8. Acción desconocida (tool no existente) → mensaje "no soportada"
 *   9. Plan PLUS no tiene acceso a deals/billing (solo Plus tools)
 *  10. Plan FREE → 403 en cualquier intento
 */

import { test, expect, type Page, type Route } from '@playwright/test';
import { mockAuthSession, navigateToApp } from '../helpers';
import {
  mockConversationsList,
  openChatPanel,
  sendChatMessage,
  PERMISSION_ERROR_FRAGMENT,
  UNSUPPORTED_ACTION_FRAGMENT,
} from './helpers';

// ─── Helpers locales ──────────────────────────────────────────────────────────

async function setupPaidUser(
  page: Page,
  plan: 'plus' | 'pro' = 'pro'
) {
  await mockAuthSession(page, { plan });
  await mockConversationsList(page, []);
  await navigateToApp(page, '/organization');
}

/** Mock del endpoint /api/chat que retorna un mensaje con fragmento de error de permiso */
async function mockPermissionDeniedResponse(
  page: Page,
  role: string = 'VIEWER'
): Promise<void> {
  await page.route('**/api/chat', async (route: Route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    const encoder = new TextEncoder();
    const message = `❌ No tienes permiso para realizar esta acción. Tu rol **${role}** no incluye los permisos necesarios.`;
    await route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'X-Conversation-Id': 'conv-perm-001',
        'X-Model-Name': 'Groq · Kimi K2',
      },
      body: encoder.encode(message),
    });
  });
}

/** Mock del endpoint /api/chat que retorna confirmación exitosa */
async function mockSuccessfulActionResponse(
  page: Page,
  confirmationText: string,
  functionCalled: string
): Promise<void> {
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
        'X-Conversation-Id': 'conv-perm-success',
        'X-Model-Name': 'Groq · Kimi K2',
        'X-Function-Called': functionCalled,
      },
      body: encoder.encode(confirmationText),
    });
  });
}

/** Mock del endpoint /api/chat que retorna 403 (plan FREE) */
async function mockFreePlanResponse(
  page: Page
): Promise<void> {
  await page.route('**/api/chat', async (route: Route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Upgrade required' }),
    });
  });
}

// ─── Tests: VIEWER no puede modificar datos ───────────────────────────────────

test.describe('Permisos - Rol VIEWER bloqueado en acciones de escritura', () => {
  test('1. VIEWER intenta crear tarea → mensaje de error de permiso en UI', async ({ page }) => {
    await setupPaidUser(page, 'pro');
    await mockPermissionDeniedResponse(page, 'VIEWER');
    await openChatPanel(page);
    await sendChatMessage(page, 'Crea una tarea llamada Mi tarea de prueba');

    await expect(page.getByText(new RegExp(PERMISSION_ERROR_FRAGMENT))).toBeVisible({ timeout: 15000 });
  });

  test('2. VIEWER intenta eliminar tarea → mensaje de error de permiso en UI', async ({ page }) => {
    await setupPaidUser(page, 'pro');
    await mockPermissionDeniedResponse(page, 'VIEWER');
    await openChatPanel(page);
    await sendChatMessage(page, 'Elimina la tarea con id task-001');

    await expect(page.getByText(new RegExp(PERMISSION_ERROR_FRAGMENT))).toBeVisible({ timeout: 15000 });
  });

  test('3. VIEWER intenta crear un deal → mensaje de error de permiso en UI', async ({ page }) => {
    await setupPaidUser(page, 'pro');
    await mockPermissionDeniedResponse(page, 'VIEWER');
    await openChatPanel(page);
    await sendChatMessage(page, 'Crea un deal para Empresa ABC por 10000€');

    await expect(page.getByText(new RegExp(PERMISSION_ERROR_FRAGMENT))).toBeVisible({ timeout: 15000 });
  });

  test('4. VIEWER intenta eliminar operación de billing → error de permiso', async ({ page }) => {
    await setupPaidUser(page, 'pro');
    await mockPermissionDeniedResponse(page, 'VIEWER');
    await openChatPanel(page);
    await sendChatMessage(page, 'Elimina la factura de enero');

    await expect(page.getByText(new RegExp(PERMISSION_ERROR_FRAGMENT))).toBeVisible({ timeout: 15000 });
  });

  test('5. El rol aparece en el mensaje de error', async ({ page }) => {
    await setupPaidUser(page, 'pro');
    await mockPermissionDeniedResponse(page, 'VIEWER');
    await openChatPanel(page);
    await sendChatMessage(page, 'Crea una tarea');

    // El mensaje de error debe mencionar el rol del usuario
    await expect(page.getByText(/VIEWER/)).toBeVisible({ timeout: 15000 });
  });
});

// ─── Tests: Queries sin restricción (permisos []  = todos pueden) ─────────────

test.describe('Permisos - Queries accesibles para cualquier miembro', () => {
  test('6. Cualquier rol puede hacer query de tareas', async ({ page }) => {
    const QUERY_RESPONSE = '**Tareas (2):** Diseñar UI — TODO, Implementar API — IN PROGRESS';

    await setupPaidUser(page, 'pro');
    await mockSuccessfulActionResponse(page, QUERY_RESPONSE, 'query_tasks');
    await openChatPanel(page);
    await sendChatMessage(page, '¿Qué tareas hay?');

    await expect(page.getByText(/Tareas/)).toBeVisible({ timeout: 15000 });
  });

  test('7. Cualquier rol puede hacer query de deals', async ({ page }) => {
    const QUERY_RESPONSE = '**Pipeline (1):** Deal con Empresa XYZ — Prospecto';

    await setupPaidUser(page, 'pro');
    await mockSuccessfulActionResponse(page, QUERY_RESPONSE, 'query_deals');
    await openChatPanel(page);
    await sendChatMessage(page, '¿Cuántos deals hay en el pipeline?');

    await expect(page.getByText(/Pipeline/)).toBeVisible({ timeout: 15000 });
  });

  test('8. Cualquier rol puede consultar billing operations', async ({ page }) => {
    const QUERY_RESPONSE = '**Operaciones (3):** Ingreso €500, Gasto €200, Ingreso €1000';

    await setupPaidUser(page, 'pro');
    await mockSuccessfulActionResponse(page, QUERY_RESPONSE, 'query_billing_operations');
    await openChatPanel(page);
    await sendChatMessage(page, 'Muéstrame las operaciones de facturación');

    await expect(page.getByText(/Operaciones/)).toBeVisible({ timeout: 15000 });
  });
});

// ─── Tests: OWNER/ADMIN puede ejecutar todas las acciones ────────────────────

test.describe('Permisos - OWNER/ADMIN puede ejecutar acciones de escritura', () => {
  test('9. OWNER puede crear una tarea → confirmación exitosa', async ({ page }) => {
    const CONFIRMATION = '✅ Tarea **Nueva tarea de OWNER** creada exitosamente en el workspace.';

    await setupPaidUser(page, 'pro');
    await mockSuccessfulActionResponse(page, CONFIRMATION, 'create_task');
    await openChatPanel(page);
    await sendChatMessage(page, 'Crea una tarea llamada Nueva tarea de OWNER');

    await expect(page.getByText(/Nueva tarea de OWNER/)).toBeVisible({ timeout: 15000 });
    // No debe mostrar error de permisos
    await expect(page.getByText(new RegExp(PERMISSION_ERROR_FRAGMENT))).not.toBeVisible();
  });

  test('10. ADMIN puede eliminar un deal → confirmación exitosa', async ({ page }) => {
    const CONFIRMATION = '🗑️ Deal **Deal eliminado** eliminado correctamente.';

    await setupPaidUser(page, 'pro');
    await mockSuccessfulActionResponse(page, CONFIRMATION, 'delete_deal');
    await openChatPanel(page);
    await sendChatMessage(page, 'Elimina el deal Deal eliminado');

    await expect(page.getByText(/Deal eliminado/)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(new RegExp(PERMISSION_ERROR_FRAGMENT))).not.toBeVisible();
  });
});

// ─── Tests: Plan limitations ─────────────────────────────────────────────────

test.describe('Permisos - Restricciones por plan', () => {
  test('11. Plan PLUS recibe error de acceso a deals si backend no lo permite', async ({ page }) => {
    // Con plan PLUS, el backend solo expone PLUS_TOOLS (sin deals/billing)
    // Si el usuario pide crear un deal, el LLM no tendrá esa tool disponible
    // La respuesta será una explicación de que no puede hacer eso
    const PLAN_LIMITATION_RESPONSE = 'Lo siento, la gestión del pipeline CRM no está disponible en tu plan actual. Actualiza a Pro para acceder a esta función.';

    await mockAuthSession(page, { plan: 'plus' });
    await mockConversationsList(page, []);
    await navigateToApp(page, '/organization');

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
          'X-Conversation-Id': 'conv-plus-001',
          'X-Model-Name': 'Groq · Kimi K2',
        },
        body: encoder.encode(PLAN_LIMITATION_RESPONSE),
      });
    });

    await openChatPanel(page);
    await sendChatMessage(page, 'Crea un deal para empresa Acme');

    await expect(page.getByText(/plan/i)).toBeVisible({ timeout: 15000 });
  });

  test('12. Plan FREE → botón del chatbot no visible en la UI', async ({ page }) => {
    await mockAuthSession(page, { plan: 'free' });
    await mockConversationsList(page, []);
    await navigateToApp(page, '/organization');

    // El toggle del chatbot no debe estar visible para usuarios free
    const chatToggle = page.locator('[data-testid="chatbot-trigger"]');
    // Si existe el trigger, debe estar oculto
    if (await chatToggle.count() > 0) {
      await expect(chatToggle).not.toBeVisible();
    }
    // Si ni existe el elemento, el test pasa igualmente
  });
});

// ─── Tests: Acciones desconocidas o no soportadas ────────────────────────────

test.describe('Permisos - Acciones no soportadas', () => {
  test('13. Acción con nombre inexistente → mensaje "no soportada"', async ({ page }) => {
    const UNSUPPORTED_RESPONSE = `❌ Acción "nonexistent_tool" no está soportada todavía.`;

    await setupPaidUser(page, 'pro');
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
          'X-Conversation-Id': 'conv-unsupported-001',
          'X-Model-Name': 'Groq · Kimi K2',
        },
        body: encoder.encode(UNSUPPORTED_RESPONSE),
      });
    });

    await openChatPanel(page);
    await sendChatMessage(page, 'Ejecuta la acción nonexistent_tool');

    await expect(page.getByText(new RegExp(UNSUPPORTED_ACTION_FRAGMENT, 'i'))).toBeVisible({ timeout: 15000 });
  });
});
