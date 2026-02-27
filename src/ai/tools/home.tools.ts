/**
 * =============================================================================
 * HOME TOOLS - Herramientas del Módulo Home
 * =============================================================================
 *
 * Este archivo contiene todas las tools relacionadas con el módulo home:
 * - Notas (crear, actualizar, eliminar)
 * - Mensajes (enviar mensaje a miembro del equipo)
 */

// ═════════════════════════════════════════════════════════════════════════════
// TYPES
// ═════════════════════════════════════════════════════════════════════════════

export interface CreateNoteArgs {
    title?: string;
    content: string;
    bgColor?: string;
}

export interface UpdateNoteArgs {
    noteSearch: string;
    title?: string;
    content?: string;
    bgColor?: string;
    isModern?: boolean;
    hasLines?: boolean;
    isPinned?: boolean;
    isGlobal?: boolean;
}

export interface DeleteNoteArgs {
    noteSearch: string;
}

export interface SendMessageArgs {
    toMemberNames: string[];
    subject?: string;
    content: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// TOOLS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Tool: create_note
 * -----------------
 * Crea una nota personal para el usuario.
 */
export const CREATE_NOTE_TOOL = {
    type: "function" as const,
    function: {
        name: "create_note",
        description: "SIEMPRE usa esta función cuando el usuario pida crear, agregar o guardar una nota, recordatorio, o algo que quiera recordar. NO simules crear la nota, debes EJECUTAR esta función para que la nota se cree realmente en la base de datos.",
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

/**
 * Tool: update_note
 * -----------------
 * Actualiza una nota existente: título, contenido, color, pin, líneas o gradiente.
 * Identifica la nota por coincidencia de texto en título o contenido.
 */
export const UPDATE_NOTE_TOOL = {
    type: "function" as const,
    function: {
        name: "update_note",
        description: "Usa esta función cuando el usuario pida modificar, editar, cambiar, pinear/anclar, despinear, agregar renglones/líneas, quitar líneas, agregar gradiente, o cambiar el color de una nota existente. Identifica la nota buscando por fragmento de título o contenido.",
        parameters: {
            type: "object",
            properties: {
                noteSearch: {
                    type: "string",
                    description: "Fragmento del título o contenido de la nota que se quiere modificar. Se usará para buscar la nota correcta."
                },
                title: {
                    type: "string",
                    description: "Nuevo título para la nota (opcional)"
                },
                content: {
                    type: "string",
                    description: "Nuevo contenido para la nota (opcional)"
                },
                bgColor: {
                    type: "string",
                    description: "Nuevo color de fondo. Valores: 'none', 'bg-red-500/20', 'bg-orange-500/20', 'bg-yellow-500/20', 'bg-green-500/20', 'bg-blue-500/20', 'bg-purple-500/20', 'bg-pink-500/20'",
                    enum: ["none", "bg-red-500/20", "bg-orange-500/20", "bg-yellow-500/20", "bg-green-500/20", "bg-blue-500/20", "bg-purple-500/20", "bg-pink-500/20"]
                },
                isModern: {
                    type: "boolean",
                    description: "true para activar el estilo con gradiente moderno, false para desactivarlo"
                },
                hasLines: {
                    type: "boolean",
                    description: "true para agregar renglones/líneas a la nota, false para quitarlos"
                },
                isPinned: {
                    type: "boolean",
                    description: "true para pinear/anclar la nota en el home, false para despinearla"
                },
                isGlobal: {
                    type: "boolean",
                    description: "true para anclar la nota globalmente (visible en la barra lateral), false para desanclarla"
                }
            },
            required: ["noteSearch"]
        }
    }
};

/**
 * Tool: delete_note
 * -----------------
 * Elimina una nota existente identificándola por fragmento de texto.
 */
export const DELETE_NOTE_TOOL = {
    type: "function" as const,
    function: {
        name: "delete_note",
        description: "Usa esta función cuando el usuario pida eliminar, borrar o quitar una nota. Identifica la nota buscando por fragmento de título o contenido.",
        parameters: {
            type: "object",
            properties: {
                noteSearch: {
                    type: "string",
                    description: "Fragmento del título o contenido de la nota que se quiere eliminar. Se usará para buscar la nota correcta."
                }
            },
            required: ["noteSearch"]
        }
    }
};

/**
 * Tool: send_message
 * ------------------
 * Envía un mensaje a uno o más compañeros del equipo.
 * Si no hay compañeros en el equipo, la acción no es posible.
 */
export const SEND_MESSAGE_TOOL = {
    type: "function" as const,
    function: {
        name: "send_message",
        description: "Usa esta función cuando el usuario quiera enviar un mensaje a uno o más compañeros del equipo. El usuario debe especificar a quién y qué mensaje. Si no hay compañeros en el equipo, la acción fallará.",
        parameters: {
            type: "object",
            properties: {
                toMemberNames: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de nombres, apellidos o emails de los compañeros de equipo a quienes enviar el mensaje"
                },
                content: {
                    type: "string",
                    description: "Contenido del mensaje a enviar"
                },
                subject: {
                    type: "string",
                    description: "Asunto del mensaje. Opcional; si se omite, el backend lo genera automáticamente."
                }
            },
            required: ["toMemberNames", "content"]
        }
    }
};

// Exportar todas las tools de home
export const HOME_TOOLS = [
    CREATE_NOTE_TOOL,
    UPDATE_NOTE_TOOL,
    DELETE_NOTE_TOOL,
    SEND_MESSAGE_TOOL,
];
