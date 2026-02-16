export const NotificationType = {
    RECURRING: 'recurring',
} as const;

export type NotificationTypeValue = typeof NotificationType[keyof typeof NotificationType];

export const NotificationEntityType = {
    NEW_WORKSPACE_MEMBER: 'new_workspace_member',
    TASK_ASSIGNED: 'task_assigned',
    CHECKLIST_ITEM_ASSIGNED: 'checklist_item_assigned',
    TASK_DUE_DATE_REMINDER: 'task_due_date_reminder',
    TASK_PRIORITY_CHANGED: 'task_priority_changed',
    TASK_COMPLETED: 'task_completed',
} as const;

export type NotificationEntityTypeValue = typeof NotificationEntityType[keyof typeof NotificationEntityType];

export const NotificationEntity = {
    WORKSPACES: 'workspaces',
    TASKS: 'tasks',
} as const;

export type NotificationEntityValue = typeof NotificationEntity[keyof typeof NotificationEntity];

export const NotificationI18nKey = {
    NEW_WORKSPACE_MEMBER_TITLE: 'notification-new-workspace-member-title',
    VIEW_WORKSPACE_LINK: 'notification-view-workspace-link',
    TASK_ASSIGNED_TITLE: 'notification-task-assigned-title',
    CHECKLIST_ITEM_ASSIGNED_TITLE: 'notification-checklist-item-assigned-title',
    TASK_DUE_DATE_REMINDER_TITLE: 'notification-task-due-date-reminder-title',
    TASK_PRIORITY_CHANGED_TITLE: 'notification-task-priority-changed-title',
    TASK_COMPLETED_TITLE: 'notification-task-completed-title',
    VIEW_TASK_LINK: 'notification-view-task-link',
} as const;

export const NotificationBodySeparator = '|';
