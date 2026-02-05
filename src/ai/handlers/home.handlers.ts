/**
 * =============================================================================
 * HOME HANDLERS - Ejecutores de Acciones del Módulo Home
 * =============================================================================
 *
 * Este archivo contiene los handlers para las acciones del módulo home:
 * - Notas (crear, editar, eliminar)
 * - Meets (crear reunión)
 * - Mensajes (enviar mensaje)
 * - Shortcuts (gestionar accesos rápidos)
 *
 * Cada handler llama al endpoint/servicio existente.
 */

import type { CreateNoteArgs } from '../tools/home.tools';
import type { ActionContext, ActionResult } from './types';

// ═════════════════════════════════════════════════════════════════════════════
// HANDLERS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Handler: create_note
 * --------------------
 * Crea una nota personal para el usuario.
 * Llama al endpoint POST /api/notes que ya existe, reenviando las cookies del usuario.
 */
export async function handleCreateNote(ctx: ActionContext): Promise<ActionResult> {
    const args = ctx.args as unknown as CreateNoteArgs;

    try {
        // Llamar al endpoint existente reenviando la cookie del usuario
        const response = await fetch(`${ctx.baseUrl}/api/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': ctx.cookie || '',
            },
            body: JSON.stringify({
                title: args.title || '',
                content: args.content,
                bgColor: args.bgColor || 'none',
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                message: `❌ No se pudo crear la nota: ${(error as { error?: string }).error || 'Error desconocido'}`,
                actionName: 'create_note',
            };
        }

        const message = `✅ ¡Nota creada exitosamente!\n\n` +
            (args.title ? `**${args.title}**\n` : '') +
            `${args.content}`;

        return {
            success: true,
            message,
            actionName: 'create_note',
        };
    } catch (error) {
        console.error('Error in handleCreateNote:', error);
        return {
            success: false,
            message: '❌ Error al crear la nota. Por favor, intenta de nuevo.',
            actionName: 'create_note',
        };
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Mapa de handlers del módulo home.
 * La key debe coincidir con el nombre del tool.
 */
export const HOME_HANDLERS = {
    create_note: handleCreateNote,
    // Agregar más handlers del home:
    // create_meet: handleCreateMeet,
    // send_message: handleSendMessage,
    // update_shortcut: handleUpdateShortcut,
};
