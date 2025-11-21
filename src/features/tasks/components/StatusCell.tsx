'use client'

import { Badge } from "@/components/ui/badge";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { useWorkspaceConfig } from "@/app/workspaces/hooks/use-workspace-config";
import { STATUS_TO_LABEL_KEY } from "@/app/workspaces/constants/workspace-config-keys";
import { TaskStatus } from "../types";

interface StatusCellProps {
    status: TaskStatus;
}

export const StatusCell = ({ status }: StatusCellProps) => {
    const config = useWorkspaceConfig();
    const labelKey = STATUS_TO_LABEL_KEY[status];
    const customLabel = config[labelKey];

    return (
        <Badge variant={status}>
            {customLabel || snakeCaseToTitleCase(status)}
        </Badge>
    );
};
