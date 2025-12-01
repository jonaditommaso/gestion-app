'use client'

import { Badge } from "@/components/ui/badge";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { useWorkspaceConfig } from "@/app/workspaces/hooks/use-workspace-config";
import { STATUS_TO_LABEL_KEY } from "@/app/workspaces/constants/workspace-config-keys";
import { TaskStatus } from "../types";
import { useCustomStatuses } from "@/app/workspaces/hooks/use-custom-statuses";

interface StatusCellProps {
    status: TaskStatus;
    statusCustomId?: string;
}

// Variants válidos para el Badge (excluye CUSTOM)
const VALID_BADGE_VARIANTS = [
    TaskStatus.BACKLOG,
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE
] as const;

type BadgeStatusVariant = typeof VALID_BADGE_VARIANTS[number];

const isValidBadgeVariant = (status: TaskStatus): status is BadgeStatusVariant => {
    return VALID_BADGE_VARIANTS.includes(status as BadgeStatusVariant);
};

export const StatusCell = ({ status, statusCustomId }: StatusCellProps) => {
    const config = useWorkspaceConfig();
    const { allStatuses } = useCustomStatuses();

    // Si es un custom status, buscar el label y color del custom status
    if (status === TaskStatus.CUSTOM && statusCustomId) {
        const customStatus = allStatuses.find(s => s.id === statusCustomId);
        if (customStatus) {
            return (
                <Badge
                    variant="outline"
                    style={{
                        backgroundColor: customStatus.color,
                        color: 'white',
                        borderColor: customStatus.color
                    }}
                >
                    {customStatus.label}
                </Badge>
            );
        }
    }

    // Para status default
    const labelKey = STATUS_TO_LABEL_KEY[status];
    const customLabel = config[labelKey];

    return (
        <Badge variant={isValidBadgeVariant(status) ? status : 'default'}>
            {customLabel || snakeCaseToTitleCase(status)}
        </Badge>
    );
};
