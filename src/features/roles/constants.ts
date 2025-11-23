export const ROLES = {
    ADMIN: "ADMIN",
    CREATOR: "CREATOR",
    VIEWER: "VIEWER"
} as const

export type RoleType = typeof ROLES[keyof typeof ROLES]

export const PERMISSIONS = {
    READ: "read",
    WRITE: "write",
    DELETE: "delete",
    MANAGE_USERS: "manage_users",
    // INVITE_MEMBERS: "invite_members",
    // MANAGE_ROLES: "manage_roles",
    // VIEW_ROLES: "view_roles",
    // VIEW_BILLING: "view_billing",
    // MANAGE_BILLING: "manage_billing",
    // CREATE_WORKSPACE: "create_workspace",
    // DELETE_WORKSPACE: "delete_workspace",
    // VIEW_RECORDS: "view_records",
    // CREATE_RECORDS: "create_records",
    // EDIT_RECORDS: "edit_records",
    // DELETE_RECORDS: "delete_records",
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

export const DEFAULT_ROLE_PERMISSIONS: Record<RoleType, Permission[]> = {
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
}

export function getPermissionBadgeColor(permission: string): string {
    return PERMISSION_COLORS[permission] || "bg-gray-100 text-gray-800"
}

export function getRoleColor(roleName: RoleType): string {
    return ROLE_METADATA[roleName]?.color || "bg-gray-100 text-gray-800"
}

// 3 roles hardcoded with their default permissions
export const rolePermissions = Object.keys(ROLES).map(roleKey => ({
    role: ROLES[roleKey as keyof typeof ROLES],
    permissions: DEFAULT_ROLE_PERMISSIONS[ROLES[roleKey as keyof typeof ROLES]],
}))