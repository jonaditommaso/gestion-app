import { CustomStatusIconValue } from "../constants/custom-status-options";

/**
 * Custom status column definition
 */
export type CustomStatus = {
    id: string; // unique identifier (e.g., "CUSTOM_1", "CUSTOM_2")
    label: string; // display name
    translationKey?: string; // translation key for default statuses
    color: string; // hex color for the icon
    icon: CustomStatusIconValue;
    position: number; // order in the kanban board
    isDefault: boolean; // if it's one of the 5 default statuses
    limitType?: 'no' | 'flexible' | 'rigid';
    limitMax?: number | null;
    protected?: boolean;
};

/**
 * Custom label/tag definition for tasks
 */
export type CustomLabel = {
    id: string; // unique identifier (e.g., "LABEL_1699999999999")
    name: string; // display name (max 20 chars)
    color: string; // hex color for background
};

/**
 * Overrides for default status columns (label, icon, color)
 */
export type DefaultStatusOverride = {
    label?: string;
    icon?: CustomStatusIconValue;
    color?: string;
};

export type SavedTaskFilter = {
    id: string;
    name: string;
    icon: string;
    color: string;
    filters: {
        status: string | null;
        assigneeId: string | null;
        squadId: string | null;
        dueDate: string | null;
        priority: number | null;
        label: string[] | null;
        type: string | null;
        completed: string | null;
    };
    unassignedOnly: boolean;
    dueThisWeekOnly: boolean;
    hidden?: boolean;
};

export type CustomTaskField = {
    id: string;
    name: string;
    type: 'text' | 'number' | 'date' | 'select';
    min?: number | null;
    max?: number | null;
    options?: string[];
};

/**
 * Workspace metadata with custom statuses
 */
export type WorkspaceMetadata = {
    backgroundColor?: string;
    workspaceIcon?: string;

    // Custom status columns
    customStatuses?: CustomStatus[];

    // Override positions for default statuses (when reordered)
    defaultStatusPositions?: Record<string, number>;

    // Override appearance for default statuses (label, icon, color)
    defaultStatusOverrides?: Record<string, DefaultStatusOverride>;

    // Hidden/deleted columns (both default and custom)
    hiddenStatuses?: string[];

    // Custom labels/tags for tasks
    customLabels?: CustomLabel[];

    // Shared saved task filters
    savedTaskFilters?: SavedTaskFilter[];

    hiddenQuickFilters?: ('unassigned' | 'dueThisWeek')[];

    customTaskFields?: CustomTaskField[];

    // Other metadata fields
    [key: string]: unknown;
};
