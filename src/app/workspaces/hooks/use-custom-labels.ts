import { useMemo } from "react";
import { useWorkspaceId } from "./use-workspace-id";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { CustomLabel, WorkspaceMetadata } from "../types/custom-status";
import { LABEL_COLORS } from "../constants/label-colors";

export const useCustomLabels = () => {
    const workspaceId = useWorkspaceId();
    const { data: workspaces } = useGetWorkspaces();

    const customLabels = useMemo<CustomLabel[]>(() => {
        const workspace = workspaces?.documents.find(ws => ws.$id === workspaceId);

        if (!workspace?.metadata) {
            return [];
        }

        const metadata: WorkspaceMetadata = typeof workspace.metadata === 'string'
            ? JSON.parse(workspace.metadata)
            : workspace.metadata;

        return metadata.customLabels || [];
    }, [workspaces, workspaceId]);

    const getLabelById = (id: string): CustomLabel | undefined => {
        return customLabels.find(label => label.id === id);
    };

    const getLabelColor = (colorValue: string) => {
        return LABEL_COLORS.find(c => c.value === colorValue);
    };

    return {
        customLabels,
        getLabelById,
        getLabelColor,
    };
};
