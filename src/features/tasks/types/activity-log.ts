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
    TASK_CREATED = 'TASK_CREATED',
    TASK_ARCHIVED = 'TASK_ARCHIVED',
    SUBTASK_CREATED = 'SUBTASK_CREATED',
    TASK_DUPLICATED = 'TASK_DUPLICATED',
    LINKED_TASK_UPDATED = 'LINKED_TASK_UPDATED',
    BUG_UPDATED = 'BUG_UPDATED',
    SPIKE_UPDATED = 'SPIKE_UPDATED',
    TEST_UPDATED = 'TEST_UPDATED',
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
    CHECKLIST_DELETED = 'checklist_deleted',
    // Assignee sub-actions
    ASSIGNEE_ADDED = 'added',
    ASSIGNEE_REMOVED = 'removed',
    // Share sub-actions
    SHARE_INTERNAL = 'internal',
    SHARE_EXTERNAL = 'external',
    // Generic
    SET = 'set',
    CLEARED = 'cleared',
    // Linked task sub-actions
    LINKED_TASK_LINKED = 'linked',
    LINKED_TASK_UNLINKED = 'unlinked',
    // Bug sub-actions
    BUG_EXPECTED_SET = 'expected_set',
    BUG_EXPECTED_CLEARED = 'expected_cleared',
    BUG_ACTUAL_SET = 'actual_set',
    BUG_ACTUAL_CLEARED = 'actual_cleared',
    BUG_ROOT_CAUSE_SET = 'root_cause_set',
    BUG_ROOT_CAUSE_CLEARED = 'root_cause_cleared',
    // Spike sub-actions
    SPIKE_FINDING_ADDED = 'finding_added',
    SPIKE_FINDING_REMOVED = 'finding_removed',
    SPIKE_CONCLUSION_SET = 'conclusion_set',
    SPIKE_CONCLUSION_CLEARED = 'conclusion_cleared',
    SPIKE_CONCLUSION_TYPE_CHANGED = 'conclusion_type_changed',
    // Test sub-actions
    TEST_SUITE_ADDED = 'suite_added',
    TEST_SUITE_REMOVED = 'suite_removed',
    TEST_CASE_ADDED = 'case_added',
    TEST_CASE_REMOVED = 'case_removed',
    TEST_CASE_STATUS_CHANGED = 'case_status_changed',
    TEST_TDD_MODE_CHANGED = 'tdd_mode_changed',
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
    subAction: 'item_added' | 'item_removed' | 'item_completed' | 'item_uncompleted' | 'title_changed' | 'checklist_deleted';
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

export interface TaskCreatedPayload {
    taskName: string;
}

export interface TaskArchivedPayload {
    archived: boolean;
}

export interface SubtaskCreatedPayload {
    taskName: string;
}

export interface TaskDuplicatedPayload {
    originalTaskId: string;
    newTaskName: string;
}

export interface LinkedTaskUpdatedPayload {
    subAction: 'linked' | 'unlinked';
    linkedTaskId?: string;
}

export interface BugUpdatedPayload {
    subAction: 'expected_set' | 'expected_cleared' | 'actual_set' | 'actual_cleared' | 'root_cause_set' | 'root_cause_cleared';
}

export interface SpikeUpdatedPayload {
    subAction: 'finding_added' | 'finding_removed' | 'conclusion_set' | 'conclusion_cleared' | 'conclusion_type_changed';
    value?: string;
}

export interface TestUpdatedPayload {
    subAction: 'suite_added' | 'suite_removed' | 'case_added' | 'case_removed' | 'case_status_changed' | 'tdd_mode_changed';
    suiteName?: string;
    caseName?: string;
    from?: string;
    to?: string;
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
    | TaskFeaturedUpdatedPayload
    | TaskCreatedPayload
    | TaskArchivedPayload
    | SubtaskCreatedPayload
    | TaskDuplicatedPayload
    | LinkedTaskUpdatedPayload
    | BugUpdatedPayload
    | SpikeUpdatedPayload
    | TestUpdatedPayload;

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
