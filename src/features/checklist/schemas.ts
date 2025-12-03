import { z as zod } from 'zod';

// ===== Checklist Items Schemas =====

export const createChecklistItemSchema = zod.object({
    taskId: zod.string().trim().min(1, 'Required'),
    workspaceId: zod.string().trim().min(1, 'Required'),
    title: zod.string().trim().min(1, 'Required').max(256),
    dueDate: zod.coerce.date().optional().nullable(),
    position: zod.number().int().optional(), // Auto-calculated if not provided
    checklistTitle: zod.string().trim().min(1, 'Required').max(100).optional(), // Title of the checklist (required on first item)
});

export const updateChecklistItemSchema = zod.object({
    title: zod.string().trim().min(1).max(256).optional(),
    completed: zod.boolean().optional(),
    dueDate: zod.coerce.date().optional().nullable(),
    position: zod.number().int().optional(),
});

export const bulkUpdateChecklistItemsSchema = zod.object({
    taskId: zod.string().trim().min(1, 'Required'),
    items: zod.array(zod.object({
        $id: zod.string().trim().min(1),
        completed: zod.boolean().optional(),
        position: zod.number().int().optional(),
    })).min(1).max(100),
});

export const getChecklistItemsSchema = zod.object({
    taskId: zod.string().trim().min(1, 'Required'),
});

export const bulkToggleChecklistItemsSchema = zod.object({
    taskId: zod.string().trim().min(1, 'Required'),
    itemIds: zod.array(zod.string().trim().min(1)).min(1).max(100),
    completed: zod.boolean(),
});

export const convertToTaskSchema = zod.object({
    itemId: zod.string().trim().min(1, 'Required'),
    workspaceId: zod.string().trim().min(1, 'Required'),
});

// ===== Checklist Item Assignees Schemas =====

export const addChecklistAssigneeSchema = zod.object({
    itemId: zod.string().trim().min(1, 'Required'),
    workspaceId: zod.string().trim().min(1, 'Required'),
    workspaceMemberId: zod.string().trim().min(1, 'Required'),
});

export const removeChecklistAssigneeSchema = zod.object({
    itemId: zod.string().trim().min(1, 'Required'),
    workspaceMemberId: zod.string().trim().min(1, 'Required'),
});

export const bulkAssignChecklistSchema = zod.object({
    itemId: zod.string().trim().min(1, 'Required'),
    workspaceId: zod.string().trim().min(1, 'Required'),
    workspaceMemberIds: zod.array(zod.string().trim().min(1)).min(1).max(50),
});

export const getChecklistAssigneesSchema = zod.object({
    itemId: zod.string().trim().min(1, 'Required'),
});
