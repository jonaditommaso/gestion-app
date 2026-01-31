/**
 * =============================================================================
 * FUNCTION CALLING - Definición de Herramientas (Tools)
 * =============================================================================
 *
 * ¿Qué es Function Calling?
 * -------------------------
 * Function calling permite que la IA "llame" funciones de tu aplicación.
 * La IA NO ejecuta código directamente. Lo que hace es:
 * 1. Analizar el mensaje del usuario
 * 2. Decidir si necesita usar una función para responder
 * 3. Devolver un JSON con el nombre de la función y los argumentos
 * 4. TU CÓDIGO ejecuta la función real
 * 5. El resultado se puede devolver al usuario
 *
 * Este archivo define LAS HERRAMIENTAS que la IA puede usar.
 * Es como un "menú" que le das a la IA para que elija.
 */

// Definición de la herramienta "create_note" en formato OpenAI/Groq
// Este formato es estándar y lo entienden la mayoría de proveedores de IA
export const CREATE_NOTE_TOOL = {
    type: "function" as const,
    function: {
        // Nombre único de la función - la IA usará este nombre para llamarla
        name: "create_note",

        // Descripción - MUY IMPORTANTE: la IA usa esto para decidir cuándo usar la función
        description: "Crea una nota personal para el usuario. Usa esta función cuando el usuario pida crear, agregar o guardar una nota, recordatorio o algo que quiera recordar.",

        // Parámetros que la función acepta (en formato JSON Schema)
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
            // Campos obligatorios
            required: ["content"]
        }
    }
};

//! Lista de todas las herramientas disponibles
// Por ahora solo tenemos una, pero aquí agregarías más en el futuro
export const ALL_TOOLS = [CREATE_NOTE_TOOL];

// Tipo para los argumentos de create_note (útil para TypeScript)
export interface CreateNoteArgs {
    title?: string;
    content: string;
    bgColor?: string;
}
