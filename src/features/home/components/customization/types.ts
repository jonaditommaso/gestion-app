export type WidgetId =
    | 'my-notes'
    | 'messages'
    | 'send-message'
    | 'shortcut'
    | 'create-meet'
    | 'calendar'
    | 'todo-tasks'
    | 'calendar-events';

export type IntegrationId =
    | 'spotify'
    | 'youtube'
    | 'google-drive';

export interface WidgetConfig {
    id: WidgetId;
    visible: boolean;
    canToggle: boolean;
}

export interface IntegrationConfig {
    id: IntegrationId;
    enabled: boolean;
}

export interface HomeConfig {
    smartWidgets: boolean;
    widgets: WidgetConfig[];
    integrations: IntegrationConfig[];
}

export interface HomeConfigDocument {
    $id: string;
    userId: string;
    widgets: string; // JSON stringified HomeConfig
    $collectionId: string;
    $databaseId: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
}

export const DEFAULT_WIDGETS: WidgetConfig[] = [
    { id: 'my-notes', visible: true, canToggle: false },
    { id: 'messages', visible: true, canToggle: false },
    { id: 'send-message', visible: true, canToggle: false },
    { id: 'shortcut', visible: true, canToggle: false },
    { id: 'create-meet', visible: true, canToggle: false },
    { id: 'calendar', visible: true, canToggle: true },
    { id: 'todo-tasks', visible: true, canToggle: true },
    { id: 'calendar-events', visible: true, canToggle: false },
];

export const DEFAULT_INTEGRATIONS: IntegrationConfig[] = [
    { id: 'spotify', enabled: false },
    { id: 'youtube', enabled: false },
    { id: 'google-drive', enabled: false },
];

export const DEFAULT_HOME_CONFIG: HomeConfig = {
    smartWidgets: false,
    widgets: DEFAULT_WIDGETS,
    integrations: DEFAULT_INTEGRATIONS,
};

export const WIDGET_LABELS: Record<WidgetId, { en: string; es: string; it: string }> = {
    'my-notes': { en: 'My Notes', es: 'Mis notas', it: 'Le mie note' },
    'messages': { en: 'Messages', es: 'Mensajes', it: 'Messaggi' },
    'send-message': { en: 'Send Message', es: 'Enviar mensaje', it: 'Invia messaggio' },
    'shortcut': { en: 'Shortcut', es: 'Atajo', it: 'Scorciatoia' },
    'create-meet': { en: 'Create Meet', es: 'Crear reunión', it: 'Crea incontro' },
    'calendar': { en: 'Calendar', es: 'Calendario', it: 'Calendario' },
    'todo-tasks': { en: 'To Do Tasks', es: 'Tareas pendientes', it: 'Attività da fare' },
    'calendar-events': { en: 'Calendar Events', es: 'Eventos de calendario', it: 'Eventi del calendario' },
};

export const INTEGRATION_LABELS: Record<IntegrationId, { en: string; es: string; it: string }> = {
    'spotify': { en: 'Spotify', es: 'Spotify', it: 'Spotify' },
    'youtube': { en: 'YouTube', es: 'YouTube', it: 'YouTube' },
    'google-drive': { en: 'Google Drive', es: 'Google Drive', it: 'Google Drive' },
};
