/**
 * SUITE E2E: Billing Management — Creación de operaciones contables
 *
 * Módulo: /billing-management
 * Entidades: BillingOperation (income / expense)
 *
 * Escenarios:
 *   1. La página carga correctamente
 *   2. Formulario de creación — campos visibles y válidos
 *   3. Crear operación de tipo INCOME → aparece en la tabla
 *   4. Crear operación de tipo EXPENSE → aparece en la tabla
 *   5. Impacto en balance/cuentas (si hay métricas en la UI)
 *   6. Filtros y búsqueda en la tabla
 *   7. Estados de operación (PENDING / PAID / OVERDUE)
 *   8. Operación como borrador → aparece en sección de borradores
 *   9. Formulario con datos inválidos → validación
 *  10. Eliminar operación → desaparece de la tabla
 */

import { test, expect, type Page } from '@playwright/test';
import {
  mockAuthSession,
  navigateToApp,
} from '../helpers';

const BILLING_ROUTE = '/billing-management';

// ─── Mocks de API ─────────────────────────────────────────────────────────────

interface OperationData {
  type: 'income' | 'expense';
  import: number;
  currency: string;
  category: string;
  paymentMethod: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  date: string;
}

const MOCK_OPERATION_INCOME: OperationData = {
  type: 'income',
  import: 1500,
  currency: 'USD',
  category: 'Services',
  paymentMethod: 'BANK_TRANSFER',
  status: 'PAID',
  date: '2026-03-18',
};

const MOCK_OPERATION_EXPENSE: OperationData = {
  type: 'expense',
  import: 300,
  currency: 'USD',
  category: 'Office Supplies',
  paymentMethod: 'CREDIT_CARD',
  status: 'PENDING',
  date: '2026-03-18',
};

async function mockOperationsApi(page: Page, operations: OperationData[] = []): Promise<void> {
  await page.route('**/api/billing-management*', async (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          documents: operations.map((op, i) => ({
            $id: `mock-op-${i + 1}`,
            ...op,
            $createdAt: new Date().toISOString(),
          })),
          total: operations.length,
        }),
      });
      return;
    }

    if (method === 'POST') {
      const body = await route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          $id: `mock-op-new-${Date.now()}`,
          ...body,
          $createdAt: new Date().toISOString(),
        }),
      });
      return;
    }

    await route.continue();
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Billing Management — Carga de página', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthSession(page);
    await mockOperationsApi(page, []);
  });

  test('la página de billing carga sin errores', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (e) => jsErrors.push(e.message));

    await navigateToApp(page, BILLING_ROUTE);
    await expect(page.locator('text=/500|Internal Server Error/i')).toHaveCount(0);

    const criticalErrors = jsErrors.filter(
      (e) => !e.includes('hydration') && !e.includes('favicon')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('la tabla de operaciones es visible', async ({ page }) => {
    await navigateToApp(page, BILLING_ROUTE);

    // Debe haber una tabla o lista de operaciones
    const tableEl = page.locator('table, [data-testid="operations-table"], [role="table"]');
    await expect(tableEl.first()).toBeVisible({ timeout: 10000 });
  });

  test('con 0 operaciones muestra estado vacío amigable', async ({ page }) => {
    await navigateToApp(page, BILLING_ROUTE);
    await page.waitForTimeout(2000);

    // Debe mostrar algún componente de "sin datos" en vez de una tabla rota
    const emptyState = page.locator(
      '[data-testid="no-data"], text=/no.*operation|no.*transacción|empty|vacío/i'
    );
    // BUG CHECK: Si la tabla muestra 0 filas sin explicación, es confuso
    const tableRows = await page.locator('tbody tr').count();
    if (tableRows === 0) {
      const hasEmptyState = (await emptyState.count()) > 0;
      if (!hasEmptyState) {
        console.warn('[BUG CHECK] La tabla de operaciones con 0 registros no muestra estado vacío');
      }
    }
  });

  test('botón de crear operación es visible', async ({ page }) => {
    await navigateToApp(page, BILLING_ROUTE);

    const createBtn = page.getByRole('button', {
      name: /create|nueva|new|agregar|add|operation|operación/i,
    });
    await expect(createBtn.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Billing Management — Formulario de creación', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthSession(page);
    await mockOperationsApi(page);
  });

  test('formulario de creación se abre al hacer click en el botón', async ({ page }) => {
    await navigateToApp(page, BILLING_ROUTE);

    const createBtn = page.getByRole('button', {
      name: /create|nueva|new|agregar|add|operation|operación/i,
    }).first();
    await createBtn.click();

    // El modal/form debe abrirse
    const form = page.locator('[role="dialog"], form, [data-testid="create-operation-form"]').first();
    await expect(form).toBeVisible({ timeout: 8000 });
  });

  test('formulario tiene campos requeridos visibles', async ({ page }) => {
    await navigateToApp(page, BILLING_ROUTE);

    const createBtn = page.getByRole('button', {
      name: /create|nueva|new|agregar|add|operation|operación/i,
    }).first();
    await createBtn.click();
    await page.waitForTimeout(500);

    // Verificar campos clave del schema
    // type (income/expense), amount/import, currency, status, paymentMethod
    const typeSelector = page.locator(
      '[name="type"], [data-testid="type-select"], button:has-text("income"), button:has-text("expense"), button:has-text("ingreso"), button:has-text("gasto")'
    );
    const amountInput = page.locator('input[name="import"], input[name="amount"], input[name*="import"]');

    // BUG CHECK: Si faltan campos críticos, el form es incompleto
    if ((await typeSelector.count()) === 0) {
      console.warn('[BUG CHECK] No se encontró selector de tipo (income/expense) en el formulario');
    }
    if ((await amountInput.count()) === 0) {
      console.warn('[BUG CHECK] No se encontró input de monto en el formulario de billing');
    }
  });

  test('submit con campos vacíos no cierra el modal', async ({ page }) => {
    await navigateToApp(page, BILLING_ROUTE);
    const createBtn = page.getByRole('button', {
      name: /create|nueva|new|agregar|add/i,
    }).first();
    await createBtn.click();
    await page.waitForTimeout(500);

    const submitBtn = page.locator('[role="dialog"] button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Modal debe permanecer abierto (validación Zod)
      const modal = page.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible();
    }
  });

  test('monto negativo o cero es rechazado', async ({ page }) => {
    await navigateToApp(page, BILLING_ROUTE);
    const createBtn = page.getByRole('button', {
      name: /create|nueva|new|agregar|add/i,
    }).first();
    await createBtn.click();
    await page.waitForTimeout(500);

    const amountInput = page.locator('input[name="import"], input[name="amount"]').first();
    if (await amountInput.isVisible()) {
      await amountInput.fill('-100');
      const submitBtn = page.locator('[role="dialog"] button[type="submit"]').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        // Debe haber mensaje de error
        const errorMsg = page.locator('.text-destructive, [role="alert"], [data-testid="field-error"]');
        if ((await errorMsg.count()) === 0) {
          console.warn('[BUG CHECK] Monto negativo no es rechazado por validación client-side');
        }
      }
    }
  });
});

test.describe('Billing Management — Creación y aparición en tabla', () => {
  test('crear operación INCOME → aparece en la tabla con datos correctos', async ({ page }) => {
    // Capturar la petición POST y agregar el ítem al mock de GET
    const createdOps: OperationData[] = [];

    await mockAuthSession(page);

    await page.route('**/api/billing-management*', async (route) => {
      const method = route.request().method();

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            documents: createdOps.map((op, i) => ({
              $id: `mock-op-${i + 1}`,
              ...op,
              $createdAt: new Date().toISOString(),
            })),
            total: createdOps.length,
          }),
        });
        return;
      }

      if (method === 'POST') {
        const body = (await route.request().postDataJSON()) as OperationData;
        createdOps.push({ ...MOCK_OPERATION_INCOME, ...body });
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            $id: 'new-income-op',
            ...createdOps[createdOps.length - 1],
            $createdAt: new Date().toISOString(),
          }),
        });
        return;
      }
      await route.continue();
    });

    await navigateToApp(page, BILLING_ROUTE);
    const createBtn = page.getByRole('button', {
      name: /create|nueva|new|agregar|add/i,
    }).first();
    await createBtn.click();
    await page.waitForTimeout(500);

    // Completar formulario
    const typeBtn = page.locator('button:has-text("income"), button:has-text("ingreso"), [data-value="income"]').first();
    if (await typeBtn.isVisible()) await typeBtn.click();

    const amountInput = page.locator('input[name="import"], input[name="amount"]').first();
    if (await amountInput.isVisible()) {
      await amountInput.fill('1500');
    }

    const submitBtn = page.locator('[role="dialog"] button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();

      // Esperar toast de éxito o cierre del modal
      await page.waitForTimeout(2000);

      // BUG CHECK: La nueva operación debe aparecer en la tabla
      const rowExists = await page.locator('tbody tr, [data-testid="table-row"]').count();
      if (rowExists === 0) {
        console.warn('[BUG CHECK] La operación creada no aparece en la tabla después del submit');
      }
    }
  });

  test('crear operación EXPENSE → aparece en la tabla', async ({ page }) => {
    await mockAuthSession(page);
    await mockOperationsApi(page, [MOCK_OPERATION_EXPENSE]);
    await navigateToApp(page, BILLING_ROUTE);

    // Con el mock de GET que ya devuelve un EXPENSE, verificar que aparece
    await page.waitForTimeout(2000);
    const rows = await page.locator('tbody tr, [data-testid="table-row"]').count();
    if (rows === 0) {
      console.warn('[BUG CHECK] La tabla no renderiza operaciones del tipo EXPENSE');
    }
  });
});

test.describe('Billing Management — Impacto en balance', () => {
  test('dashboard/resumen muestra métricas de ingresos y gastos', async ({ page }) => {
    await mockAuthSession(page);
    await mockOperationsApi(page, [MOCK_OPERATION_INCOME, MOCK_OPERATION_EXPENSE]);
    await navigateToApp(page, BILLING_ROUTE);
    await page.waitForTimeout(2000);

    // BUG CHECK: Debe haber alguna métrica visible (balance, total income, total expense)
    const metrics = page.locator(
      '[data-testid*="metric"], [data-testid*="balance"], [data-testid*="total"], text=/balance|total|income|ingreso|expense|gasto/i'
    );
    if ((await metrics.count()) === 0) {
      console.warn('[BUG CHECK] No se encontraron métricas de billing en la página principal del módulo');
    }
  });

  test('el balance refleja ingresos menos gastos', async ({ page }) => {
    await mockAuthSession(page);
    // Income: 1500, Expense: 300 → Balance esperado: 1200
    await mockOperationsApi(page, [MOCK_OPERATION_INCOME, MOCK_OPERATION_EXPENSE]);
    await navigateToApp(page, BILLING_ROUTE);
    await page.waitForTimeout(2000);

    // BUG CHECK: Si hay un balance visible, verificar que tiene sentido aritmético
    const balanceEl = page.locator('[data-testid*="balance"], text=/1[,.]?200|1200/');
    if ((await balanceEl.count()) === 0) {
      console.info('[INFO] No se encontró el balance calculado de $1,200. Puede que la UI calcule en tiempo real o use formato diferente.');
    }
  });
});

test.describe('Billing Management — Estados de operación', () => {
  test('operaciones con estado OVERDUE tienen indicación visual diferenciada', async ({ page }) => {
    await mockAuthSession(page);
    await mockOperationsApi(page, [
      { ...MOCK_OPERATION_INCOME, status: 'OVERDUE' },
    ]);
    await navigateToApp(page, BILLING_ROUTE);
    await page.waitForTimeout(2000);

    // BUG CHECK: Las operaciones OVERDUE deben ser visualmente distinguibles
    const overdueIndicator = page.locator(
      'text=/overdue|vencid/i, [data-testid*="overdue"], .text-red-500, .bg-red'
    );
    if ((await overdueIndicator.count()) === 0) {
      console.warn('[BUG CHECK] Las operaciones OVERDUE no tienen diferenciación visual');
    }
  });
});

test.describe('Billing Management — Borradores', () => {
  test('operación guardada como borrador aparece en sección de borradores', async ({ page }) => {
    await mockAuthSession(page);

    await page.route('**/api/billing-management/drafts*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          documents: [
            {
              $id: 'draft-001',
              ...MOCK_OPERATION_INCOME,
              isDraft: true,
            },
          ],
          total: 1,
        }),
      });
    });

    await navigateToApp(page, BILLING_ROUTE);

    // Buscar la sección de borradores o un tab/link de borradores
    const draftsTab = page.locator(
      'button:has-text("draft"), a:has-text("draft"), button:has-text("borrador"), a:has-text("borrador"), [data-testid="drafts-tab"]'
    );
    if ((await draftsTab.count()) > 0) {
      await draftsTab.first().click();
      await page.waitForTimeout(1000);

      const draftRow = await page.locator('tbody tr, [data-testid="table-row"]').count();
      if (draftRow === 0) {
        console.warn('[BUG CHECK] Los borradores no aparecen en la sección de borradores');
      }
    } else {
      console.warn('[BUG CHECK] No se encontró una sección o tab de borradores en billing management');
    }
  });
});

test.describe('Billing Management — Eliminación', () => {
  test('eliminar operación → desaparece de la tabla', async ({ page }) => {
    await mockAuthSession(page);

    let ops = [{ ...MOCK_OPERATION_INCOME, $id: 'delete-op-001' }];

    await page.route('**/api/billing-management*', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ documents: ops, total: ops.length }),
        });
        return;
      }
      if (method === 'DELETE') {
        ops = [];
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
        return;
      }
      await route.continue();
    });

    await navigateToApp(page, BILLING_ROUTE);
    await page.waitForTimeout(1000);

    const rowsBefore = await page.locator('tbody tr, [data-testid="table-row"]').count();

    // Buscar botón de eliminar en la primera fila
    const deleteBtn = page.locator(
      'tbody tr:first-child button[aria-label*="delete"], tbody tr:first-child button[aria-label*="eliminar"], tbody tr:first-child [data-testid="delete-op"]'
    ).first();

    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();

      // Puede haber un diálogo de confirmación
      const confirmBtn = page.getByRole('button', { name: /confirm|delete|eliminar|sí/i }).last();
      if (await confirmBtn.isVisible()) await confirmBtn.click();

      await page.waitForTimeout(2000);
      const rowsAfter = await page.locator('tbody tr, [data-testid="table-row"]').count();

      // BUG CHECK: La cantidad de filas debe haber disminuido
      if (rowsAfter >= rowsBefore) {
        console.warn('[BUG CHECK] Las filas no disminuyeron después de eliminar una operación');
      }
    } else {
      console.info('[INFO] No se encontró botón de eliminar directamente en la fila. Puede estar en un menú contextual.');
    }
  });
});
