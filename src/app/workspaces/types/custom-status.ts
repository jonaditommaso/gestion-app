import { CustomStatusIconValue } from "../constants/custom-status-options";

/**
 * Custom status column definition
 */
export type CustomStatus = {
    id: string; // unique identifier (e.g., "CUSTOM_1", "CUSTOM_2")
    label: string; // display name
    color: string; // hex color for the icon
    icon: CustomStatusIconValue;
    position: number; // order in the kanban board
    isDefault: boolean; // if it's one of the 5 default statuses
    limitType?: 'no' | 'flexible' | 'rigid';
    limitMax?: number | null;
    protected?: boolean;
};

/**
 * Overrides for default status columns (label, icon, color)
 */
export type DefaultStatusOverride = {
    label?: string;
    icon?: CustomStatusIconValue;
    color?: string;
};

/**
 * Workspace metadata with custom statuses
 */
export type WorkspaceMetadata = {
    // Custom status columns
    customStatuses?: CustomStatus[];

    // Override positions for default statuses (when reordered)
    defaultStatusPositions?: Record<string, number>;

    // Override appearance for default statuses (label, icon, color)
    defaultStatusOverrides?: Record<string, DefaultStatusOverride>;

    // Hidden/deleted columns (both default and custom)
    hiddenStatuses?: string[];

    // Other metadata fields
    [key: string]: unknown;
};
