/**
 * =============================================================================
 * ACTION HANDLERS TYPES - Tipos Compartidos
 * =============================================================================
 */

export type MembershipRole = 'OWNER' | 'ADMIN' | 'CREATOR' | 'VIEWER';

/**
 * Contexto que reciben todos los handlers.
 * Contiene todo lo necesario para ejecutar acciones autenticadas.
 */
export interface ActionContext {
    userId: string; // ID del usuario que ejecuta la acción
    userEmail: string; // Email del usuario
    cookie: string; // Cookie header del request original, para reenviar autenticación al endpoint
    baseUrl: string; // URL base de la app (ej: http://localhost:3000) para llamar a endpoints internos
    args: Record<string, unknown>; // Argumentos parseados del tool call
    userRole: MembershipRole; // Rol del usuario en la organización activa
    userPermissions: string[]; // Permisos efectivos del usuario (broad o granulares según config del org)
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
