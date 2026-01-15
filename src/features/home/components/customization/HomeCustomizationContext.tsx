'use client'
import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { HomeConfig, DEFAULT_HOME_CONFIG, WidgetId, IntegrationId, configToOverrides, mergeConfigWithOverrides } from './types';
import { useGetHomeConfig } from '../../api/use-get-home-config';
import { useUpdateHomeConfig } from '../../api/use-update-home-config';

interface HomeCustomizationContextType {
    isEditMode: boolean;
    setIsEditMode: (value: boolean) => void;
    config: HomeConfig;
    originalConfig: HomeConfig;
    hasChanges: boolean;
    toggleWidgetVisibility: (widgetId: WidgetId) => void;
    toggleIntegration: (integrationId: IntegrationId) => void;
    toggleSmartWidgets: () => void;
    setTaskWidgetStatus: (statusId: string) => void;
    saveChanges: () => void;
    cancelChanges: () => void;
    isSaving: boolean;
    isLoading: boolean;
    isWidgetVisible: (widgetId: WidgetId) => boolean;
    canToggleWidget: (widgetId: WidgetId) => boolean;
}

const HomeCustomizationContext = createContext<HomeCustomizationContextType | undefined>(undefined);

export const useHomeCustomization = () => {
    const context = useContext(HomeCustomizationContext);
    if (!context) {
        throw new Error('useHomeCustomization must be used within a HomeCustomizationProvider');
    }
    return context;
};

interface HomeCustomizationProviderProps {
    children: ReactNode;
}

export const HomeCustomizationProvider = ({ children }: HomeCustomizationProviderProps) => {
    const { data: savedConfig, isLoading } = useGetHomeConfig();
    const { mutate: updateConfig, isPending: isSaving } = useUpdateHomeConfig();

    const [isEditMode, setIsEditMode] = useState(false);
    const [localConfig, setLocalConfig] = useState<HomeConfig | null>(null);

    const parsedSavedConfig = useMemo<HomeConfig>(() => {
        if (savedConfig?.widgets) {
            try {
                const overrides = JSON.parse(savedConfig.widgets);
                // Si el formato antiguo tiene un array 'widgets', usamos mergeConfigWithOverrides
                // Si no, asumimos que es el formato nuevo de overrides
                if (Array.isArray(overrides.widgets)) {
                    // Formato antiguo - convertir a overrides
                    const oldConfig = overrides as HomeConfig;
                    const newOverrides = configToOverrides(oldConfig);
                    return mergeConfigWithOverrides(newOverrides);
                }
                return mergeConfigWithOverrides(overrides);
            } catch {
                return DEFAULT_HOME_CONFIG;
            }
        }
        return DEFAULT_HOME_CONFIG;
    }, [savedConfig]);

    const config = useMemo(() => {
        return localConfig ?? parsedSavedConfig;
    }, [localConfig, parsedSavedConfig]);

    const originalConfig = parsedSavedConfig;

    const hasChanges = useMemo(() => {
        return JSON.stringify(config) !== JSON.stringify(originalConfig);
    }, [config, originalConfig]);

    const toggleWidgetVisibility = useCallback((widgetId: WidgetId) => {
        setLocalConfig(prev => {
            const current = prev ?? parsedSavedConfig;
            return {
                ...current,
                widgets: current.widgets.map(w =>
                    w.id === widgetId && w.canToggle
                        ? { ...w, visible: !w.visible }
                        : w
                )
            };
        });
    }, [parsedSavedConfig]);

    const toggleIntegration = useCallback((integrationId: IntegrationId) => {
        setLocalConfig(prev => {
            const current = prev ?? parsedSavedConfig;
            return {
                ...current,
                integrations: current.integrations.map(i =>
                    i.id === integrationId
                        ? { ...i, enabled: !i.enabled }
                        : i
                )
            };
        });
    }, [parsedSavedConfig]);

    const toggleSmartWidgets = useCallback(() => {
        setLocalConfig(prev => {
            const current = prev ?? parsedSavedConfig;
            return {
                ...current,
                smartWidgets: !current.smartWidgets
            };
        });
    }, [parsedSavedConfig]);

    const setTaskWidgetStatus = useCallback((statusId: string) => {
        // Crear el nuevo config con el status actualizado
        const current = localConfig ?? parsedSavedConfig;
        const newConfig: HomeConfig = {
            ...current,
            taskWidgetStatusId: statusId
        };

        // Actualizar estado local inmediatamente para UI responsiva
        setLocalConfig(newConfig);

        // Guardar en la base de datos
        const overrides = configToOverrides(newConfig);
        updateConfig({
            json: { widgets: JSON.stringify(overrides) }
        }, {
            onSettled: () => {
                // Limpiar local config después de que se complete
                setLocalConfig(null);
            }
        });
    }, [localConfig, parsedSavedConfig, updateConfig]);

    const saveChanges = useCallback(() => {
        // Convertir el config completo a overrides (solo cambios respecto al default)
        const overrides = configToOverrides(config);

        updateConfig({
            json: { widgets: JSON.stringify(overrides) }
        }, {
            onSuccess: () => {
                setIsEditMode(false);
                // Don't clear localConfig here - the optimistic update already handled it
                // The parsedSavedConfig will update when the query refetches
            },
            onSettled: () => {
                // Clear local config after the mutation settles (success or error handled)
                setLocalConfig(null);
            }
        });
    }, [config, updateConfig]);

    const cancelChanges = useCallback(() => {
        setLocalConfig(null);
        setIsEditMode(false);
    }, []);

    const isWidgetVisible = useCallback((widgetId: WidgetId): boolean => {
        const widget = config.widgets.find(w => w.id === widgetId);
        return widget?.visible ?? true;
    }, [config]);

    const canToggleWidget = useCallback((widgetId: WidgetId): boolean => {
        const widget = config.widgets.find(w => w.id === widgetId);
        return widget?.canToggle ?? false;
    }, [config]);

    const value: HomeCustomizationContextType = {
        isEditMode,
        setIsEditMode,
        config,
        originalConfig,
        hasChanges,
        toggleWidgetVisibility,
        toggleIntegration,
        toggleSmartWidgets,
        setTaskWidgetStatus,
        saveChanges,
        cancelChanges,
        isSaving,
        isLoading,
        isWidgetVisible,
        canToggleWidget,
    };

    return (
        <HomeCustomizationContext.Provider value={value}>
            {children}
        </HomeCustomizationContext.Provider>
    );
};
