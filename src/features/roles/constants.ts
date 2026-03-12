export const ROLES = {
    OWNER: "OWNER",
    ADMIN: "ADMIN",
    CREATOR: "CREATOR",
    VIEWER: "VIEWER"
} as const

export type RoleType = typeof ROLES[keyof typeof ROLES]

// Active permissions — used for role configuration and access checks
export const PERMISSIONS = {
    READ: "read",
    WRITE: "write",
    DELETE: "delete",
    MANAGE_USERS: "manage_users",
    MANAGE_SUBSCRIPTION: "manage_subscription",
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

export const DEFAULT_ROLE_PERMISSIONS: Record<RoleType, Permission[]> = {
    [ROLES.OWNER]: [
        PERMISSIONS.READ,
        PERMISSIONS.WRITE,
        PERMISSIONS.DELETE,
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.MANAGE_SUBSCRIPTION,
    ],
    [ROLES.ADMIN]: [
        PERMISSIONS.READ,
        PERMISSIONS.WRITE,
        PERMISSIONS.DELETE,
        PERMISSIONS.MANAGE_USERS,
    ],
    [ROLES.CREATOR]: [
        PERMISSIONS.READ,
        PERMISSIONS.WRITE,
        PERMISSIONS.DELETE,
    ],
    [ROLES.VIEWER]: [
        PERMISSIONS.READ,
    ],
}

export const ROLE_METADATA: Record<RoleType, {
    name: string
    description: string
    color: string
}> = {
    [ROLES.OWNER]: {
        name: "owner",
        description: "owner-description",
        color: "bg-amber-100 text-amber-800"
    },
    [ROLES.ADMIN]: {
        name: "admin",
        description: "admin-description",
        color: "bg-red-100 text-red-800"
    },
    [ROLES.CREATOR]: {
        name: "creator",
        description: "creator-description",
        color: "bg-blue-100 text-blue-800"
    },
    [ROLES.VIEWER]: {
        name: "viewer",
        description: "viewer-description",
        color: "bg-green-100 text-green-800"
    },
}

export const PERMISSION_COLORS: Record<string, string> = {
    read: "bg-green-100 text-green-800",
    write: "bg-blue-100 text-blue-800",
    delete: "bg-red-100 text-red-800",
    manage_users: "bg-purple-100 text-purple-800",
    manage_subscription: "bg-amber-100 text-amber-800",
}

export function getPermissionBadgeColor(permission: string): string {
    if (PERMISSION_COLORS[permission]) return PERMISSION_COLORS[permission]
    if (permission.startsWith("view_")) return "bg-green-100 text-green-800"
    if (permission.startsWith("create_")) return "bg-blue-100 text-blue-800"
    if (permission.startsWith("edit_")) return "bg-yellow-100 text-yellow-800"
    if (permission.startsWith("delete_")) return "bg-red-100 text-red-800"
    if (permission.startsWith("archive_")) return "bg-orange-100 text-orange-800"
    if (permission.startsWith("restore_")) return "bg-teal-100 text-teal-800"
    if (permission.startsWith("download_") || permission.startsWith("export_")) return "bg-indigo-100 text-indigo-800"
    if (permission.startsWith("mark_")) return "bg-pink-100 text-pink-800"
    if (permission.startsWith("public_")) return "bg-cyan-100 text-cyan-800"
    if (permission.startsWith("feature_")) return "bg-yellow-100 text-yellow-800"
    if (permission.startsWith("manage_")) return "bg-purple-100 text-purple-800"
    if (permission.startsWith("send_")) return "bg-sky-100 text-sky-800"
    if (permission.startsWith("invite_")) return "bg-violet-100 text-violet-800"
    if (permission.startsWith("remove_")) return "bg-rose-100 text-rose-800"
    if (permission.startsWith("schedule_")) return "bg-amber-100 text-amber-800"
    return "bg-gray-100 text-gray-800"
}

export function getRoleColor(roleName: RoleType): string {
    return ROLE_METADATA[roleName]?.color || "bg-gray-100 text-gray-800"
}

// Permission catalog — all permissions offered by the platform, grouped by module.
// Used for the informational dialog. New permissions are added here as modules are implemented.
export const PERMISSION_CATALOG: Array<{ moduleKey: string; permissions: string[] }> = [
    {
        moduleKey: "module-general",
        permissions: ["read", "write", "delete", "manage_users", "manage_subscription"],
    },
    {
        moduleKey: "module-billing",
        permissions: [
            "view_billing",
            "view_details_billing",
            "view_calendar_billing",
            "view_followup_billing",
            "view_drafts_billing",
            "view_incomes_billing",
            "view_expenses_billing",
            "view_categories_billing",
            "view_archived_billing",
            "create_billing_operation",
            "create_draft_billing_operation",
            "delete_billing_operation",
            "delete_draft_billing_operation",
            "create_category_billing",
            "edit_category_billing",
            "delete_category_billing",
            "download_billing",
            "export_billing",
            "mark_paid_billing",
            "public_draft_billing_operation",
            "edit_billing_operation",
            "edit_draft_billing_operation",
            "archive_billing_operation",
            "restore_billing_operation",
        ],
    },
    {
        moduleKey: "module-meets",
        permissions: [
            "view_meets",
            "create_meet",
            "edit_meet",
            "delete_meet",
            "schedule_meet",
        ],
    },
    {
        moduleKey: "module-messages",
        permissions: [
            "view_messages",
            "send_message",
            "feature_message",
            "delete_message",
        ],
    },
    {
        moduleKey: "module-sells",
        permissions: [
            "view_sells",
            "create_pipeline",
            "edit_pipeline",
            "delete_pipeline",
            "view_goals_history",
            "set_goal",
            "manage_sellers",
            "create_deal",
            "move_deal",
            "mark_deal_result",
            "delete_deal",
            "revert_deal_result",
            "set_deal_next_step",
            "view_activity_deal",
            "add_activity_deal",
            "set_deal_close_date",
            "view_kanban_sells",
            "view_list_sells",
            "view_charts_sells",
            "view_health_score_details_deal"
        ],
    },
    // {
    //     moduleKey: "module-home",
    //     permissions: [
    //         "view_home",
    //         "edit_settings",
    //         "manage_integrations",
    //     ],
    // },
    {
        moduleKey: "module-team",
        permissions: [
            "view_team",
            "invite_member",
            "remove_member",
        ],
    },
    {
        moduleKey: "module-workspaces",
        permissions: [
            "view_workspaces",
            "create_workspace",
            "archive_workspace",
            "delete_workspace",
            "view_kanban_workspaces",
            "view_table_workspaces",
            "view_calendar_workspaces",
            "create_task",
            "edit_task",
            "delete_task",
            "share_task",
            "feature_task",
            "archive_task",
            "view_archived_tasks",
            "restore_task",
            "duplicate_task",
            "move_task",
            "view_task",
            "edit_description_task",
            "comment_task",
            "view_comments_task",
            "delete_comment_task",
            "add_subtask_task",
            "add_checklist_task",
            "edit_checklist_task",
            "delete_checklist_task",
            "mark_checklist_task",
            "add_assignee_task",
            "remove_assignee_task",
            "view_history_task",
            "view_info_workspace",
            "edit_info_description_workspace",
            "edit_name_workspace",
            "manage_members_workspace",
            "create_labels_workspace",
            "edit_labels_workspace",
            "delete_labels_workspace",
            "view_labels_workspace",
            "edit_background_workspace",
            "view_general_settings_workspace",
            "edit_general_settings_workspace",
            "edit_column_names_workspace",
            "add_column_workspace",
            "delete_column_workspace",
        ],
    },
]

// Roles with their default permissions (hardcoded)
export const rolePermissions = Object.keys(ROLES).map(roleKey => ({
    role: ROLES[roleKey as keyof typeof ROLES],
    permissions: DEFAULT_ROLE_PERMISSIONS[ROLES[roleKey as keyof typeof ROLES]],
}))