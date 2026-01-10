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

// Tipos para guardar solo los overrides (cambios respecto al default)
export type PartialWidgetConfig = Partial<Omit<WidgetConfig, 'id'>>;
export type PartialIntegrationConfig = Partial<Omit<IntegrationConfig, 'id'>>;

export interface HomeConfigOverrides {
    smartWidgets?: boolean;
    widgets?: Record<WidgetId, PartialWidgetConfig>;
    integrations?: Record<IntegrationId, PartialIntegrationConfig>;
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

/**
 * Convierte un HomeConfig completo a overrides (solo los cambios respecto al default)
 */
export function configToOverrides(config: HomeConfig): HomeConfigOverrides {
    const overrides: HomeConfigOverrides = {};

    // Solo guardamos smartWidgets si difiere del default
    if (config.smartWidgets !== DEFAULT_HOME_CONFIG.smartWidgets) {
        overrides.smartWidgets = config.smartWidgets;
    }

    // Solo guardamos widgets que difieren del default
    const widgetOverrides: Record<string, PartialWidgetConfig> = {};
    config.widgets.forEach(widget => {
        const defaultWidget = DEFAULT_WIDGETS.find(w => w.id === widget.id);
        if (defaultWidget) {
            const changes: PartialWidgetConfig = {};
            if (widget.visible !== defaultWidget.visible) {
                changes.visible = widget.visible;
            }
            if (Object.keys(changes).length > 0) {
                widgetOverrides[widget.id] = changes;
            }
        }
    });
    if (Object.keys(widgetOverrides).length > 0) {
        overrides.widgets = widgetOverrides as Record<WidgetId, PartialWidgetConfig>;
    }

    // Solo guardamos integraciones que difieren del default
    const integrationOverrides: Record<string, PartialIntegrationConfig> = {};
    config.integrations.forEach(integration => {
        const defaultIntegration = DEFAULT_INTEGRATIONS.find(i => i.id === integration.id);
        if (defaultIntegration) {
            const changes: PartialIntegrationConfig = {};
            if (integration.enabled !== defaultIntegration.enabled) {
                changes.enabled = integration.enabled;
            }
            if (Object.keys(changes).length > 0) {
                integrationOverrides[integration.id] = changes;
            }
        }
    });
    if (Object.keys(integrationOverrides).length > 0) {
        overrides.integrations = integrationOverrides as Record<IntegrationId, PartialIntegrationConfig>;
    }

    return overrides;
}

/**
 * Combina los overrides con el default para obtener el HomeConfig completo
 */
export function mergeConfigWithOverrides(overrides: HomeConfigOverrides): HomeConfig {
    const config: HomeConfig = {
        smartWidgets: overrides.smartWidgets ?? DEFAULT_HOME_CONFIG.smartWidgets,
        widgets: DEFAULT_WIDGETS.map(defaultWidget => {
            const override = overrides.widgets?.[defaultWidget.id];
            return {
                ...defaultWidget,
                ...override,
            };
        }),
        integrations: DEFAULT_INTEGRATIONS.map(defaultIntegration => {
            const override = overrides.integrations?.[defaultIntegration.id];
            return {
                ...defaultIntegration,
                ...override,
            };
        }),
    };

    return config;
}
