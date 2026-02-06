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
import type { ActionHandler, ActionContext, ActionResult } from './types';

/**
 * Mapa completo de todos los action handlers disponibles.
 * La key debe coincidir con el nombre del tool en tools/.
 */
export const ACTION_HANDLERS: Record<string, ActionHandler> = {
    ...HOME_HANDLERS,
    // Cuando agregues más módulos, impórtalos aquí:
    // ...TASKS_HANDLERS,
    // ...RECORDS_HANDLERS,
    // ...TEAM_HANDLERS,
};

/**
 * Ejecuta un action handler por nombre.
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

    return handler(ctx);
}

// Re-exportar tipos para conveniencia
export type { ActionContext, ActionResult, ActionHandler } from './types';
