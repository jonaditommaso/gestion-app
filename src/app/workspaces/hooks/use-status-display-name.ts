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
        // CUSTOM status no usa este hook, usa el label del custom status directamente
        if (status === TaskStatus.CUSTOM) {
            return 'Custom';
        }

        const labelKey = STATUS_TO_LABEL_KEY[status as string];
        const customLabel = labelKey ? config[labelKey] as string | null : null;

        // Obtener la traducción key desde TASK_STATUS_OPTIONS
        const statusOption: Record<string, string> = {
            'BACKLOG': 'backlog',
            'TODO': 'todo',
            'IN_PROGRESS': 'in-progress',
            'IN_REVIEW': 'in-review',
            'DONE': 'done',
        };

        return customLabel || t(statusOption[status] || status.toLowerCase());
    };

    return { getStatusDisplayName };
};
