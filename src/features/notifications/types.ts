export const NotificationType = {
    RECURRING: 'recurring',
} as const;

export type NotificationTypeValue = typeof NotificationType[keyof typeof NotificationType];

export const NotificationEntityType = {
    NEW_WORKSPACE_MEMBER: 'new_workspace_member',
} as const;

export type NotificationEntityTypeValue = typeof NotificationEntityType[keyof typeof NotificationEntityType];

export const NotificationEntity = {
    WORKSPACES: 'workspaces',
} as const;

export type NotificationEntityValue = typeof NotificationEntity[keyof typeof NotificationEntity];

export const NotificationI18nKey = {
    NEW_WORKSPACE_MEMBER_TITLE: 'notification-new-workspace-member-title',
    VIEW_WORKSPACE_LINK: 'notification-view-workspace-link',
} as const;

export const NotificationBodySeparator = '|';
