/**
 * Fixtures y helpers compartidos para los tests E2E de módulos
 *
 * Estrategia:
 * - Todos los módulos requieren autenticación.
 * - Para evitar dependencia del backend real en cada test, se mockea
 *   la respuesta de /api/auth/current con un usuario autenticado,
 *   y se mockean las respuestas de los endpoints específicos del módulo.
 *
 * Para tests de integración completa contra el backend real,
 * configurar las variables de entorno TEST_* en .env.test
 */

import { type Page } from '@playwright/test';

// ─── Tipos ──────────────────────────────────────────────────────────────────

export interface MockUser {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'plus' | 'pro';
}

export interface MockWorkspace {
  $id: string;
  name: string;
  organizationId: string;
}

// ─── Datos de test ───────────────────────────────────────────────────────────

export const MOCK_USER: MockUser = {
  id: 'mock-user-001',
  name: 'E2E Tester',
  email: 'e2e.tester@mailinator.com',
  plan: 'pro',
};

export const MOCK_WORKSPACE: MockWorkspace = {
  $id: 'mock-ws-001',
  name: 'Test Workspace',
  organizationId: 'mock-org-001',
};

// Variables de entorno para tests contra backend real
export const REAL_USER = {
  email: process.env.TEST_USER_EMAIL ?? '',
  password: process.env.TEST_USER_PASSWORD ?? '',
  workspaceId: process.env.TEST_WORKSPACE_ID ?? '',
};

export const hasRealCredentials = Boolean(REAL_USER.email && REAL_USER.password);

// ─── Helpers de autenticación ────────────────────────────────────────────────

/** Mockea un usuario autenticado para evitar el redirect a /login */
export async function mockAuthSession(page: Page, user: Partial<MockUser> = {}): Promise<void> {
  const u = { ...MOCK_USER, ...user };
  await page.route('**/api/auth/current', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        $id: u.id,
        name: u.name,
        email: u.email,
        labels: [u.plan],
      }),
    });
  });
}

/** Navega a la app y espera a que cargue el layout principal */
export async function navigateToApp(page: Page, path: string = '/'): Promise<void> {
  await page.goto(path);
  // Esperar a que no haya un spinner/loader global
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
}

/** Realiza login real con credenciales de entorno (para tests de integración) */
export async function realLogin(page: Page): Promise<void> {
  if (!hasRealCredentials) {
    throw new Error('Test user credentials not configured. Set TEST_USER_EMAIL and TEST_USER_PASSWORD.');
  }
  await page.goto('/login');
  await page.fill('input[name="email"]', REAL_USER.email);
  await page.fill('input[name="password"]', REAL_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 20000 });
}

// ─── Helpers de UI ───────────────────────────────────────────────────────────

/** Espera a que un toast/notificación de éxito sea visible */
export async function waitForSuccessToast(page: Page): Promise<void> {
  await page.locator(
    '[data-sonner-toast][data-type="success"], [data-testid="success-toast"], .sonner-toast'
  ).first().waitFor({ state: 'visible', timeout: 10000 });
}

/** Espera a que un toast/notificación de error sea visible */
export async function waitForErrorToast(page: Page): Promise<void> {
  await page.locator(
    '[data-sonner-toast][data-type="error"], [role="alert"], .sonner-toast'
  ).first().waitFor({ state: 'visible', timeout: 10000 });
}

/** Abre un dialog/modal buscando por texto del botón que lo abre */
export async function openDialogByButton(page: Page, buttonText: RegExp | string): Promise<void> {
  const btn = page.getByRole('button', { name: buttonText });
  await btn.waitFor({ state: 'visible', timeout: 10000 });
  await btn.click();
  // Esperar a que el modal esté visible
  await page.locator('[role="dialog"], [data-testid*="modal"], [data-testid*="dialog"]')
    .first()
    .waitFor({ state: 'visible', timeout: 8000 });
}

/** Cierra el dialog abierto */
export async function closeDialog(page: Page): Promise<void> {
  const closeBtn = page.locator(
    '[role="dialog"] button[aria-label*="close"], [role="dialog"] button[aria-label*="cerrar"], [data-testid="dialog-close"]'
  ).first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
  } else {
    await page.keyboard.press('Escape');
  }
}

/** Espera a que una tabla tenga al menos N filas */
export async function waitForTableRows(page: Page, minRows: number = 1): Promise<number> {
  await page.locator('tbody tr, [data-testid="table-row"]').first().waitFor({
    state: 'visible',
    timeout: 15000,
  });
  return page.locator('tbody tr, [data-testid="table-row"]').count();
}
