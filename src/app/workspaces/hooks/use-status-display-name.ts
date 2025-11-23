import { useTranslations } from "next-intl";
import { useWorkspaceConfig } from "./use-workspace-config";
import { STATUS_TO_LABEL_KEY } from "../constants/workspace-config-keys";
import { TaskStatus } from "@/features/tasks/types";

/**
 * Hook para obtener el nombre de visualización de un status
 * Retorna el label personalizado si existe, o la traducción por defecto
 */
export const useStatusDisplayName = () => {
    const t = useTranslations('workspaces');
    const config = useWorkspaceConfig();

    const getStatusDisplayName = (status: TaskStatus): string => {
        const labelKey = STATUS_TO_LABEL_KEY[status];
        const customLabel = labelKey ? config[labelKey] as string | null : null;

        // Obtener la traducción key desde TASK_STATUS_OPTIONS
        const statusOption = {
            'BACKLOG': 'backlog',
            'TODO': 'todo',
            'IN_PROGRESS': 'in-progress',
            'IN_REVIEW': 'in-review',
            'DONE': 'done',
        }[status] || status.toLowerCase();

        return customLabel || t(statusOption);
    };

    return { getStatusDisplayName };
};
