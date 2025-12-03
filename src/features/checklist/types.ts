import { Models } from "node-appwrite";

/**
 * Checklist Item - individual item within a task checklist
 * Uses integer-with-gaps ordering strategy (position with 1024 gaps)
 */
export type ChecklistItem = Models.Document & {
    taskId: string;
    workspaceId: string;
    title: string;
    completed: boolean;
    dueDate?: string | null;
    position: number;
    createdBy: string;
    updatedBy?: string | null;
    convertedToTaskId?: string | null;
}

/**
 * Checklist Item Assignee - allows multiple assignees per checklist item
 */
export type ChecklistItemAssignee = Models.Document & {
    itemId: string;
    workspaceId: string;
    workspaceMemberId: string;
    createdBy: string;
}

/**
 * Populated checklist item with assignee details for UI
 */
export type PopulatedChecklistItem = ChecklistItem & {
    assignees: {
        $id: string;
        workspaceMemberId: string;
        name?: string;
    }[];
}

/**
 * Checklist progress summary
 */
export type ChecklistProgress = {
    total: number;
    completed: number;
    percentage: number;
}

/**
 * Position gap constant for ordering
 */
export const POSITION_GAP = 1024;

/**
 * Calculate new position between two items
 */
export function calculatePosition(before: number | null, after: number | null): number {
    if (before === null && after === null) {
        return POSITION_GAP;
    }
    if (before === null) {
        return Math.floor(after! / 2);
    }
    if (after === null) {
        return before + POSITION_GAP;
    }
    return Math.floor((before + after) / 2);
}
