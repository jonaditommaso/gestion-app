import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { TaskStatus } from '../types'
import { useWorkspaceConfig } from '@/app/workspaces/hooks/use-workspace-config'
import { STATUS_TO_LABEL_KEY } from '@/app/workspaces/constants/workspace-config-keys'
import { TASK_STATUS_OPTIONS } from '../constants/status'
import { useMemo } from 'react'

/**
 * Hook que maneja los filtros de tareas con labels personalizados en la URL
 * Convierte entre labels personalizados (URL) y status keys (lógica interna)
 */
export const useTaskFilters = () => {
    const config = useWorkspaceConfig();

    // Mapeo: label normalizado -> status key
    const labelToStatus = useMemo(() => {
        const map: Record<string, TaskStatus> = {};
        TASK_STATUS_OPTIONS.forEach(status => {
            const labelKey = STATUS_TO_LABEL_KEY[status.value];
            const customLabel = config[labelKey];
            if (customLabel) {
                // Normalizar label: reemplazar espacios con guiones, mantener mayúsculas
                const normalizedLabel = customLabel.replace(/\s+/g, '-');
                map[normalizedLabel] = status.value as TaskStatus;
            }
        });
        return map;
    }, [config]);

    // Mapeo: status key -> label normalizado
    const statusToLabel = useMemo(() => {
        const map: Record<string, string> = {};
        TASK_STATUS_OPTIONS.forEach(status => {
            const labelKey = STATUS_TO_LABEL_KEY[status.value];
            const customLabel = config[labelKey];
            if (customLabel) {
                const normalizedLabel = customLabel.replace(/\s+/g, '-');
                map[status.value] = normalizedLabel;
            } else {
                // Si no hay label personalizado, usar el valor del enum
                map[status.value] = status.value;
            }
        });
        return map;
    }, [config]);

    const [filters, setFilters] = useQueryStates({
        status: parseAsString,
        assigneeId: parseAsString,
        search: parseAsString,
        dueDate: parseAsString,
        priority: parseAsInteger,
        label: parseAsArrayOf(parseAsString),
        type: parseAsString,
        completed: parseAsString,
    });

    // Convertir el status de la URL (label) a status key
    const statusKey = useMemo(() => {
        if (!filters.status) return null;
        // Intentar mapear desde label personalizado (case-insensitive)
        const mappedStatus = labelToStatus[filters.status] ||
            Object.entries(labelToStatus).find(
                ([label]) => label.toLowerCase() === filters.status!.toLowerCase()
            )?.[1];
        if (mappedStatus) return mappedStatus;
        // Si no hay mapeo, intentar usar como enum directo
        const upperStatus = filters.status.toUpperCase().replace(/-/g, '_');
        if (Object.values(TaskStatus).includes(upperStatus as TaskStatus)) {
            return upperStatus as TaskStatus;
        }
        return null;
    }, [filters.status, labelToStatus]);

    // Wrapper para setFilters que convierte status key a label
    const setFiltersWithLabel = (newFilters: Partial<{
        status: string | null;
        assigneeId: string | null;
        search: string | null;
        dueDate: string | null;
        priority: number | null;
        label: string[] | null;
        type: string | null;
        completed: string | null;
    }>) => {
        const modifiedFilters: Partial<{
            status: string | null;
            assigneeId: string | null;
            search: string | null;
            dueDate: string | null;
            priority: number | null;
            label: string[] | null;
            type: string | null;
            completed: string | null;
        }> = { ...newFilters };

        if ('status' in modifiedFilters && modifiedFilters.status !== undefined) {
            if (modifiedFilters.status === null) {
                // Si es null, mantener null
                modifiedFilters.status = null;
            } else {
                // Convertir status key a label para la URL
                const label = statusToLabel[modifiedFilters.status];
                modifiedFilters.status = label || modifiedFilters.status;
            }
        }

        setFilters(modifiedFilters);
    };

    return [
        {
            ...filters,
            status: statusKey, // Retornar el status key para la lógica interna
        },
        setFiltersWithLabel
    ] as const;
}