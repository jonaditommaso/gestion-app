/**
 * =============================================================================
 * HANDLERS INDEX - Punto Central de Todos los Action Handlers
 * =============================================================================
 *
 * Este archivo centraliza todos los handlers de diferentes módulos.
 * Importa y combina los handlers de cada feature para formar ACTION_HANDLERS.
 *
 * Para agregar un nuevo handler:
 * 1. Créalo en el archivo correspondiente (ej: tasks.handlers.ts)
 * 2. Impórtalo y agrégalo a ACTION_HANDLERS aquí
 */

import { HOME_HANDLERS } from './home.handlers';
import { TASKS_HANDLERS } from './tasks.handlers';
import { BILLING_HANDLERS } from './billing.handlers';
import { DEALS_HANDLERS } from './deals.handlers';
import type { ActionHandler, ActionContext, ActionResult } from './types';

/**
 * Mapa completo de todos los action handlers disponibles.
 * La key debe coincidir con el nombre del tool en tools/.
 */
export const ACTION_HANDLERS: Record<string, ActionHandler> = {
    ...HOME_HANDLERS,
    ...TASKS_HANDLERS,
    ...BILLING_HANDLERS,
    ...DEALS_HANDLERS,
    // Cuando agregues más módulos, impórtalos aquí:
    // ...RECORDS_HANDLERS,
    // ...TEAM_HANDLERS,
};

/**
 * Mapa tool → permisos requeridos.
 * El usuario debe tener AL MENOS UNO de los permisos listados.
 * Cada entrada incluye el permiso granular (Pro/Enteprise) y el broad equivalente (Plus).
 * Los tools con array vacío son accesibles por cualquier miembro autenticado.
 */
const TOOL_PERMISSIONS: Record<string, string[]> = {
    // Home — notas son personales, sin restricción de rol
    create_note: [],
    update_note: [],
    delete_note: [],
    send_message: ['send_message', 'write'],

    // Tasks (module-workspaces)
    query_tasks: [],
    create_task: ['create_task', 'write'],
    update_task: ['edit_task', 'write'],
    delete_task: ['delete_task', 'delete'],
    add_task_comment: ['comment_task', 'write'],
    add_checklist_item: ['add_checklist_task', 'write'],
    assign_task_member: ['add_assignee_task', 'write'],
    bulk_move_tasks: ['move_task', 'write'],
    archive_task: ['archive_task', 'delete'],

    // Billing (module-billing)
    query_billing_operations: [],
    create_billing_operation: ['create_billing_operation', 'write'],
    update_billing_operation: ['edit_billing_operation', 'write'],
    delete_billing_operation: ['delete_billing_operation', 'delete'],
    manage_billing_categories: ['create_category_billing', 'write'],

    // Deals (module-sells)
    query_deals: [],
    query_deal_goals: [],
    create_deal: ['create_deal', 'write'],
    update_deal: ['move_deal', 'write'],
    delete_deal: ['delete_deal', 'delete'],
    add_deal_comment: ['add_activity_deal', 'write'],
    manage_deal_assignees: ['manage_sellers', 'write'],
    bulk_update_deals: ['move_deal', 'write'],
};

/**
 * Ejecuta un action handler por nombre.
 * Verifica los permisos del usuario antes de delegar al handler.
 *
 * @param actionName - Nombre de la acción (debe coincidir con el tool name)
 * @param ctx - Contexto de ejecución
 * @returns Resultado de la acción
 */
export async function executeAction(
    actionName: string,
    ctx: ActionContext
): Promise<ActionResult> {
    const handler = ACTION_HANDLERS[actionName];

    if (!handler) {
        return {
            success: false,
            message: `❌ Acción "${actionName}" no está soportada todavía.`,
            actionName,
        };
    }

    const requiredPerms = TOOL_PERMISSIONS[actionName] ?? [];
    if (requiredPerms.length > 0) {
        const hasPermission = requiredPerms.some(p => ctx.userPermissions.includes(p));
        if (!hasPermission) {
            return {
                success: false,
                message: `❌ No tienes permiso para realizar esta acción. Tu rol **${ctx.userRole}** no incluye los permisos necesarios.`,
                actionName,
            };
        }
    }

    return handler(ctx);
}

// Re-exportar tipos para conveniencia
export type { ActionContext, ActionResult, ActionHandler } from './types';
