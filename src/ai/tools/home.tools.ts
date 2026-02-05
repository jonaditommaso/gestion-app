/**
 * =============================================================================
 * HOME TOOLS - Herramientas del Módulo Home
 * =============================================================================
 *
 * Este archivo contiene todas las tools relacionadas con el módulo home:
 * - Notas (crear, editar, eliminar)
 * - Meets (crear reunión con Google Calendar)
 * - Mensajes (enviar mensaje a miembro del equipo)
 * - Shortcuts (crear/actualizar accesos rápidos)
 */

// ═════════════════════════════════════════════════════════════════════════════
// TYPES
// ═════════════════════════════════════════════════════════════════════════════

export interface CreateNoteArgs {
    title?: string;
    content: string;
    bgColor?: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// TOOLS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Tool: create_note
 * -----------------
 * Permite al usuario crear una nota personal desde el chat.
 */
export const CREATE_NOTE_TOOL = {
    type: "function" as const,
    function: {
        name: "create_note",
        description: "Crea una nota personal para el usuario. Usa esta función cuando el usuario pida crear, agregar o guardar una nota, recordatorio o algo que quiera recordar.",
        parameters: {
            type: "object",
            properties: {
                title: {
                    type: "string",
                    description: "Título corto y descriptivo para la nota (máximo 50 caracteres)"
                },
                content: {
                    type: "string",
                    description: "Contenido completo de la nota (máximo 256 caracteres)"
                },
                bgColor: {
                    type: "string",
                    description: "Color de fondo de la nota. Valores posibles: 'none', 'bg-red-500/20', 'bg-orange-500/20', 'bg-yellow-500/20', 'bg-green-500/20', 'bg-blue-500/20', 'bg-purple-500/20', 'bg-pink-500/20'. Por defecto usar 'none'",
                    enum: ["none", "bg-red-500/20", "bg-orange-500/20", "bg-yellow-500/20", "bg-green-500/20", "bg-blue-500/20", "bg-purple-500/20", "bg-pink-500/20"]
                }
            },
            required: ["content"]
        }
    }
};

// Exportar todas las tools de home
export const HOME_TOOLS = [
    CREATE_NOTE_TOOL,
    // Agregar más tools del home aquí:
    // CREATE_MEET_TOOL,
    // SEND_MESSAGE_TOOL,
    // UPDATE_SHORTCUT_TOOL,
];
