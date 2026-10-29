import type { WorkspaceMetadata } from "../types/custom-status";

export const parseWorkspaceMetadata = (metadata?: string | null): WorkspaceMetadata => {
    if (!metadata) return {};

    try {
        const parsed: unknown = JSON.parse(metadata);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            return parsed as WorkspaceMetadata;
        }
    } catch (error) {
        console.error('Error parsing workspace metadata:', error);
    }

    return {};
};
