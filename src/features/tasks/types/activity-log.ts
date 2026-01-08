import { Models } from "node-appwrite";

/**
 * Activity log action types
 */
export enum ActivityAction {
    TASK_STATUS_UPDATED = 'TASK_STATUS_UPDATED',
    DESCRIPTION_UPDATED = 'DESCRIPTION_UPDATED',
    COMMENT_UPDATED = 'COMMENT_UPDATED',
    LABEL_UPDATED = 'LABEL_UPDATED',
    PRIORITY_UPDATED = 'PRIORITY_UPDATED',
    DUE_DATE_UPDATED = 'DUE_DATE_UPDATED',
    CHECKLIST_UPDATED = 'CHECKLIST_UPDATED',
    ASSIGNEES_UPDATED = 'ASSIGNEES_UPDATED',
    TASK_TYPE_UPDATED = 'TASK_TYPE_UPDATED',
    TASK_NAME_UPDATED = 'TASK_NAME_UPDATED',
    TASK_SHARED = 'TASK_SHARED',
    TASK_FEATURED_UPDATED = 'TASK_FEATURED_UPDATED',
}

/**
 * Sub-actions for more specific activity tracking
 */
export enum ActivitySubAction {
    // Comment sub-actions
    COMMENT_CREATED = 'created',
    COMMENT_EDITED = 'edited',
    COMMENT_DELETED = 'deleted',
    // Checklist sub-actions
    CHECKLIST_ITEM_ADDED = 'item_added',
    CHECKLIST_ITEM_REMOVED = 'item_removed',
    CHECKLIST_ITEM_COMPLETED = 'item_completed',
    CHECKLIST_ITEM_UNCOMPLETED = 'item_uncompleted',
    CHECKLIST_TITLE_CHANGED = 'title_changed',
    // Assignee sub-actions
    ASSIGNEE_ADDED = 'added',
    ASSIGNEE_REMOVED = 'removed',
    // Share sub-actions
    SHARE_INTERNAL = 'internal',
    SHARE_EXTERNAL = 'external',
    // Generic
    SET = 'set',
    CLEARED = 'cleared',
}

/**
 * Payload types for each action
 */
export interface StatusUpdatedPayload {
    from: string;
    fromCustomId?: string | null;
    to: string;
    toCustomId?: string | null;
}

export interface DescriptionUpdatedPayload {
    subAction: 'set' | 'cleared';
    // We don't store the actual content for privacy/size reasons
}

export interface CommentUpdatedPayload {
    subAction: 'created' | 'edited' | 'deleted';
    commentId: string;
}

export interface LabelUpdatedPayload {
    from: string | null;  // Now stores label name directly (snapshot)
    to: string | null;    // Now stores label name directly (snapshot)
}

export interface PriorityUpdatedPayload {
    from: number;
    to: number;
}

export interface DueDateUpdatedPayload {
    from: string | null;
    to: string | null;
}

export interface ChecklistUpdatedPayload {
    subAction: 'item_added' | 'item_removed' | 'item_completed' | 'item_uncompleted' | 'title_changed';
    itemTitle?: string;
    checklistTitle?: string;
}

export interface AssigneesUpdatedPayload {
    subAction: 'added' | 'removed';
    memberId: string;
    memberName: string;
}

export interface TaskTypeUpdatedPayload {
    from: string;
    to: string;
}

export interface TaskNameUpdatedPayload {
    from: string;
    to: string;
}

export interface TaskSharedPayload {
    subAction: 'internal' | 'external';
    sharedToUserId?: string;
    sharedToName?: string;
    recipientCount?: number;
}

export interface TaskFeaturedUpdatedPayload {
    from: boolean;
    to: boolean;
}

/**
 * Union type for all payloads
 */
export type ActivityPayload =
    | StatusUpdatedPayload
    | DescriptionUpdatedPayload
    | CommentUpdatedPayload
    | LabelUpdatedPayload
    | PriorityUpdatedPayload
    | DueDateUpdatedPayload
    | ChecklistUpdatedPayload
    | AssigneesUpdatedPayload
    | TaskTypeUpdatedPayload
    | TaskNameUpdatedPayload
    | TaskSharedPayload
    | TaskFeaturedUpdatedPayload;

/**
 * Activity log document type
 */
export type TaskActivityLog = Models.Document & {
    taskId: string;
    actorMemberId: string;
    action: ActivityAction;
    payload: string; // JSON stringified ActivityPayload
    // Populated fields
    actor?: {
        $id: string;
        name: string;
        email: string;
    };
};

/**
 * Parsed activity log with typed payload
 */
export interface ParsedActivityLog extends Omit<TaskActivityLog, 'payload'> {
    payload: ActivityPayload;
}
