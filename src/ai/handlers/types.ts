/**
 * Contexto que reciben todos los handlers.
 * Contiene todo lo necesario para ejecutar acciones autenticadas.
 */
export interface ActionContext {
    userId: string; /** ID del usuario que ejecuta la acción */
    userEmail: string; /** Email del usuario */
    args: Record<string, unknown>; /** Argumentos parseados del tool call */
}

/**
 * Resultado de ejecutar una acción.
 */
export interface ActionResult {
    success: boolean; /** Si la acción fue exitosa */
    message: string; /** Mensaje para mostrar al usuario */
    actionName: string; /** Nombre de la acción ejecutada (para invalidar queries en el frontend) */
    data?: unknown; /** Datos adicionales (opcional) */
}

/**
 * Firma de un action handler.
 */
export type ActionHandler = (ctx: ActionContext) => Promise<ActionResult>;
