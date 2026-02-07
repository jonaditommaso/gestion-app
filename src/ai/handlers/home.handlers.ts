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
        const url = `${ctx.baseUrl}/api/notes`;
        const payload = {
            title: args.title || '',
            content: args.content,
            bgColor: args.bgColor || 'none',
        };

        console.log('[CREATE_NOTE] Request details:', {
            url,
            payload,
            hasCookie: !!ctx.cookie,
            cookieLength: ctx.cookie?.length || 0,
        });

        // Llamar al endpoint existente reenviando la cookie del usuario
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': ctx.cookie || '',
            },
            body: JSON.stringify(payload),
        });

        console.log('[CREATE_NOTE] Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('[CREATE_NOTE] Error response:', error);
            return {
                success: false,
                message: `❌ No se pudo crear la nota: ${(error as { error?: string }).error || 'Error desconocido'}`,
                actionName: 'create_note',
            };
        }

        const responseData = await response.json();
        console.log('[CREATE_NOTE] Success response:', responseData);

        const message = `✅ ¡Nota creada exitosamente!\n\n` +
            (args.title ? `**${args.title}**\n` : '') +
            `${args.content}`;

        return {
            success: true,
            message,
            actionName: 'create_note',
        };
    } catch (error) {
        console.error('[CREATE_NOTE] Exception:', error);
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
