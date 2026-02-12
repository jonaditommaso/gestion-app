/**
 * Workspace configuration keys
 * These keys are used to store workspace settings in the database
 */
export enum WorkspaceConfigKey {
    // Workflow
    DEFAULT_TASK_STATUS = 'defaultTaskStatus',
    AUTO_ARCHIVE_COMPLETED = 'autoArchiveCompleted',
    AUTO_ARCHIVE_ON_STATUS_ID = 'autoArchiveOnStatusId',
    SHOW_CARD_COUNT = 'showCardCount',

    // Column Limits - per status
    LIMIT_BACKLOG_TYPE = 'limitBacklogType',
    LIMIT_BACKLOG_MAX = 'limitBacklogMax',
    LIMIT_TODO_TYPE = 'limitTodoType',
    LIMIT_TODO_MAX = 'limitTodoMax',
    LIMIT_IN_PROGRESS_TYPE = 'limitInProgressType',
    LIMIT_IN_PROGRESS_MAX = 'limitInProgressMax',
    LIMIT_IN_REVIEW_TYPE = 'limitInReviewType',
    LIMIT_IN_REVIEW_MAX = 'limitInReviewMax',
    LIMIT_DONE_TYPE = 'limitDoneType',
    LIMIT_DONE_MAX = 'limitDoneMax',

    // Protected Columns - per status
    PROTECTED_BACKLOG = 'protectedBacklog',
    PROTECTED_TODO = 'protectedTodo',
    PROTECTED_IN_PROGRESS = 'protectedInProgress',
    PROTECTED_IN_REVIEW = 'protectedInReview',
    PROTECTED_DONE = 'protectedDone',

    // Column Labels - per status
    LABEL_BACKLOG = 'labelBacklog',
    LABEL_TODO = 'labelTodo',
    LABEL_IN_PROGRESS = 'labelInProgress',
    LABEL_IN_REVIEW = 'labelInReview',
    LABEL_DONE = 'labelDone',

    // Task Preferences
    REQUIRED_ASSIGNEE = 'requiredAssignee',
    REQUIRED_DUE_DATE = 'requiredDueDate',
    REQUIRED_DESCRIPTION = 'requiredDescription',
    COMPACT_CARDS = 'compactCards',
    AUTO_ASSIGN_ON_CREATE = 'autoAssignOnCreate',
    GENERATE_TASK_CODE = 'generateTaskCode',
    DATE_FORMAT = 'dateFormat',
    PUBLIC_LINK_EXPIRATION_DAYS = 'publicLinkExpirationDays',
    MULTI_SELECT_LABELS = 'multiSelectLabels',
    HIDE_EPIC_PROGRESS_BAR = 'hideEpicProgressBar',
    TABLE_PAGE_SIZE = 'tablePageSize',

    // Notifications
    NOTIFY_TASK_ASSIGNMENT = 'notifyTaskAssignment',
    NOTIFY_DUE_DATE_REMINDER = 'notifyDueDateReminder',
    NOTIFY_TASK_NO_MOVEMENT = 'notifyTaskNoMovement',
    NOTIFY_MEMBER_NO_TASKS = 'notifyMemberNoTasks',

    // Permissions
    TASK_CREATION_ADMIN_ONLY = 'taskCreationAdminOnly',
    DELETE_TASKS_ADMIN_ONLY = 'deleteTasksAdminOnly',
    CREATE_COLUMNS_ADMIN_ONLY = 'createColumnsAdminOnly',
    EDIT_COLUMNS_ADMIN_ONLY = 'editColumnsAdminOnly',
    EDIT_LABELS_ADMIN_ONLY = 'editLabelsAdminOnly',
    INVITE_MEMBERS_ADMIN_ONLY = 'inviteMembersAdminOnly',
}

/**
 * Column limit types
 */
export enum ColumnLimitType {
    NO = 'no',
    FLEXIBLE = 'flexible',
    RIGID = 'rigid',
}

/**
 * Date format types
 */
export enum DateFormatType {
    SHORT = 'short',
    LONG = 'long',
}

/**
 * Show card count types
 */
export enum ShowCardCountType {
    ALWAYS = 'always',
    FILTERED = 'filtered',
    NEVER = 'never',
}

/**
 * Default workspace configuration values
 */
export const DEFAULT_WORKSPACE_CONFIG = {
    [WorkspaceConfigKey.DEFAULT_TASK_STATUS]: 'BACKLOG',
    [WorkspaceConfigKey.AUTO_ARCHIVE_COMPLETED]: false,
    [WorkspaceConfigKey.AUTO_ARCHIVE_ON_STATUS_ID]: null,
    [WorkspaceConfigKey.SHOW_CARD_COUNT]: ShowCardCountType.ALWAYS,

    // Column limits defaults - all set to no limit
    [WorkspaceConfigKey.LIMIT_BACKLOG_TYPE]: ColumnLimitType.NO,
    [WorkspaceConfigKey.LIMIT_BACKLOG_MAX]: null,
    [WorkspaceConfigKey.LIMIT_TODO_TYPE]: ColumnLimitType.NO,
    [WorkspaceConfigKey.LIMIT_TODO_MAX]: null,
    [WorkspaceConfigKey.LIMIT_IN_PROGRESS_TYPE]: ColumnLimitType.NO,
    [WorkspaceConfigKey.LIMIT_IN_PROGRESS_MAX]: null,
    [WorkspaceConfigKey.LIMIT_IN_REVIEW_TYPE]: ColumnLimitType.NO,
    [WorkspaceConfigKey.LIMIT_IN_REVIEW_MAX]: null,
    [WorkspaceConfigKey.LIMIT_DONE_TYPE]: ColumnLimitType.NO,
    [WorkspaceConfigKey.LIMIT_DONE_MAX]: null,

    // Protected columns - all unprotected by default
    [WorkspaceConfigKey.PROTECTED_BACKLOG]: false,
    [WorkspaceConfigKey.PROTECTED_TODO]: false,
    [WorkspaceConfigKey.PROTECTED_IN_PROGRESS]: false,
    [WorkspaceConfigKey.PROTECTED_IN_REVIEW]: false,
    [WorkspaceConfigKey.PROTECTED_DONE]: false,

    // Column labels - null by default (use translation)
    [WorkspaceConfigKey.LABEL_BACKLOG]: null,
    [WorkspaceConfigKey.LABEL_TODO]: null,
    [WorkspaceConfigKey.LABEL_IN_PROGRESS]: null,
    [WorkspaceConfigKey.LABEL_IN_REVIEW]: null,
    [WorkspaceConfigKey.LABEL_DONE]: null,

    // Task preferences
    [WorkspaceConfigKey.REQUIRED_ASSIGNEE]: false,
    [WorkspaceConfigKey.REQUIRED_DUE_DATE]: false,
    [WorkspaceConfigKey.REQUIRED_DESCRIPTION]: false,
    [WorkspaceConfigKey.COMPACT_CARDS]: false,
    [WorkspaceConfigKey.AUTO_ASSIGN_ON_CREATE]: false,
    [WorkspaceConfigKey.GENERATE_TASK_CODE]: true, // enabled by default
    [WorkspaceConfigKey.DATE_FORMAT]: DateFormatType.LONG,
    [WorkspaceConfigKey.PUBLIC_LINK_EXPIRATION_DAYS]: 5, // 5 days by default
    [WorkspaceConfigKey.MULTI_SELECT_LABELS]: false, // single select by default
    [WorkspaceConfigKey.HIDE_EPIC_PROGRESS_BAR]: false, // show progress bar by default
    [WorkspaceConfigKey.TABLE_PAGE_SIZE]: 10, // 10 items per page by default

    // Notifications - assignment and reminders enabled by default
    [WorkspaceConfigKey.NOTIFY_TASK_ASSIGNMENT]: true,
    [WorkspaceConfigKey.NOTIFY_DUE_DATE_REMINDER]: true,
    [WorkspaceConfigKey.NOTIFY_TASK_NO_MOVEMENT]: false,
    [WorkspaceConfigKey.NOTIFY_MEMBER_NO_TASKS]: false,

    // Permissions - all open to all members by default
    [WorkspaceConfigKey.TASK_CREATION_ADMIN_ONLY]: false,
    [WorkspaceConfigKey.DELETE_TASKS_ADMIN_ONLY]: false,
    [WorkspaceConfigKey.CREATE_COLUMNS_ADMIN_ONLY]: false,
    [WorkspaceConfigKey.EDIT_COLUMNS_ADMIN_ONLY]: false,
    [WorkspaceConfigKey.EDIT_LABELS_ADMIN_ONLY]: false,
    [WorkspaceConfigKey.INVITE_MEMBERS_ADMIN_ONLY]: false,
} as const;

/**
 * Helper to map TASK_STATUS to column limit config keys
 */
export const STATUS_TO_LIMIT_KEYS: Record<string, { type: WorkspaceConfigKey; max: WorkspaceConfigKey }> = {
    'BACKLOG': {
        type: WorkspaceConfigKey.LIMIT_BACKLOG_TYPE,
        max: WorkspaceConfigKey.LIMIT_BACKLOG_MAX,
    },
    'TODO': {
        type: WorkspaceConfigKey.LIMIT_TODO_TYPE,
        max: WorkspaceConfigKey.LIMIT_TODO_MAX,
    },
    'IN_PROGRESS': {
        type: WorkspaceConfigKey.LIMIT_IN_PROGRESS_TYPE,
        max: WorkspaceConfigKey.LIMIT_IN_PROGRESS_MAX,
    },
    'IN_REVIEW': {
        type: WorkspaceConfigKey.LIMIT_IN_REVIEW_TYPE,
        max: WorkspaceConfigKey.LIMIT_IN_REVIEW_MAX,
    },
    'DONE': {
        type: WorkspaceConfigKey.LIMIT_DONE_TYPE,
        max: WorkspaceConfigKey.LIMIT_DONE_MAX,
    },
};

/**
 * Helper to map TASK_STATUS to protected column config keys
 */
export const STATUS_TO_PROTECTED_KEY: Record<string, WorkspaceConfigKey> = {
    'BACKLOG': WorkspaceConfigKey.PROTECTED_BACKLOG,
    'TODO': WorkspaceConfigKey.PROTECTED_TODO,
    'IN_PROGRESS': WorkspaceConfigKey.PROTECTED_IN_PROGRESS,
    'IN_REVIEW': WorkspaceConfigKey.PROTECTED_IN_REVIEW,
    'DONE': WorkspaceConfigKey.PROTECTED_DONE,
};

/**
 * Helper to map TASK_STATUS to column label config keys
 */
export const STATUS_TO_LABEL_KEY: Record<string, WorkspaceConfigKey> = {
    'BACKLOG': WorkspaceConfigKey.LABEL_BACKLOG,
    'TODO': WorkspaceConfigKey.LABEL_TODO,
    'IN_PROGRESS': WorkspaceConfigKey.LABEL_IN_PROGRESS,
    'IN_REVIEW': WorkspaceConfigKey.LABEL_IN_REVIEW,
    'DONE': WorkspaceConfigKey.LABEL_DONE,
};
