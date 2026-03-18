/**
 * Helpers compartidos para todos los tests E2E
 *
 * - Sección 1: Helpers de auth (signup, login, logout, redirección)
 * - Sección 2: Helpers de módulos (mock de sesión, navegación, UI)
 */

import { type Page } from '@playwright/test';

// ─── Tipos ────────────────────────────────────────────────────────────────────

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

// ─── Credenciales de test ─────────────────────────────────────────────────────

export const TEST_USER = {
  name: 'Test E2E User',
  email: `e2e.test+${Date.now()}@mailinator.com`,
  password: 'TestPassword123!',
};

export const EXISTING_FREE_USER = {
  email: process.env.TEST_FREE_EMAIL ?? 'e2e.free@mailinator.com',
  password: process.env.TEST_FREE_PASSWORD ?? 'TestPassword123!',
};

export const EXISTING_PAID_USER = {
  email: process.env.TEST_PAID_EMAIL ?? 'e2e.paid@mailinator.com',
  password: process.env.TEST_PAID_PASSWORD ?? 'TestPassword123!',
};

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

export const REAL_USER = {
  email: process.env.TEST_USER_EMAIL ?? '',
  password: process.env.TEST_USER_PASSWORD ?? '',
  workspaceId: process.env.TEST_WORKSPACE_ID ?? '',
};

export const hasRealCredentials = Boolean(REAL_USER.email && REAL_USER.password);

// ─── Helpers de navegación (auth) ─────────────────────────────────────────────

export async function goToSignup(page: Page): Promise<void> {
  await page.goto('/signup');
  await page.waitForSelector('input[name="email"]', { state: 'visible' });
}

export async function goToLogin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.waitForSelector('input[name="email"]', { state: 'visible' });
}

export async function loginWith(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await goToLogin(page);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
}

export async function waitForAuthRedirect(page: Page): Promise<void> {
  await page.waitForURL((url) => {
    const p = url.pathname;
    return !p.startsWith('/login') && !p.startsWith('/signup') && !p.startsWith('/mfa');
  }, { timeout: 20000 });
}

export async function logout(page: Page): Promise<void> {
  const userBtn = page.locator('[data-testid="user-button"]').first();
  if (await userBtn.isVisible()) {
    await userBtn.click();
    const logoutBtn = page.getByRole('menuitem', { name: /logout|sign out|cerrar sesión|esci/i });
    await logoutBtn.click();
    await page.waitForURL(/\/(login|signup)/);
  }
}

// ─── Helpers de autenticación mock (módulos) ──────────────────────────────────

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

export async function navigateToApp(page: Page, path: string = '/'): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
}

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

// ─── Helpers de UI ────────────────────────────────────────────────────────────

export async function waitForSuccessToast(page: Page): Promise<void> {
  await page.locator(
    '[data-sonner-toast][data-type="success"], [data-testid="success-toast"], .sonner-toast'
  ).first().waitFor({ state: 'visible', timeout: 10000 });
}

export async function waitForErrorToast(page: Page): Promise<void> {
  await page.locator(
    '[data-sonner-toast][data-type="error"], [role="alert"], .sonner-toast'
  ).first().waitFor({ state: 'visible', timeout: 10000 });
}

export async function openDialogByButton(page: Page, buttonText: RegExp | string): Promise<void> {
  const btn = page.getByRole('button', { name: buttonText });
  await btn.waitFor({ state: 'visible', timeout: 10000 });
  await btn.click();
  await page.locator('[role="dialog"], [data-testid*="modal"], [data-testid*="dialog"]')
    .first()
    .waitFor({ state: 'visible', timeout: 8000 });
}

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

export async function waitForTableRows(page: Page, minRows: number = 1): Promise<number> {
  await page.locator('tbody tr, [data-testid="table-row"]').first().waitFor({
    state: 'visible',
    timeout: 15000,
  });
  const count = await page.locator('tbody tr, [data-testid="table-row"]').count();
  if (count < minRows) {
    throw new Error(`Expected at least ${minRows} rows, found ${count}`);
  }
  return count;
}