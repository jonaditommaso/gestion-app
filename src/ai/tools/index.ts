/**
 * =============================================================================
 * TOOLS INDEX - Punto Central de Todas las Herramientas
 * =============================================================================
 *
 * Este archivo centraliza todas las tools de diferentes módulos.
 * Importa y combina las tools de cada feature para formar ALL_TOOLS.
 *
 * Para agregar una nueva tool:
 * 1. Créala en el archivo correspondiente (ej: tasks.tools.ts)
 * 2. Impórtala y agrégala a ALL_TOOLS aquí
 */

import { HOME_TOOLS } from './home.tools';

/**
 * Lista completa de todas las herramientas disponibles.
 * La IA recibirá este array y decidirá cuál usar.
 */
export const ALL_TOOLS = [
    ...HOME_TOOLS,
    // Cuando agregues más módulos, impórtalos aquí:
    // ...TASKS_TOOLS,
    // ...RECORDS_TOOLS,
    // ...TEAM_TOOLS,
];

// Re-exportar tipos de tools específicas para conveniencia
export type { CreateNoteArgs } from './home.tools';
