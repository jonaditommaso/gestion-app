"use client"

import { useState } from "react"
import type { User, Role } from "../types"
import { mockUsers, mockRoles } from "../constants"

export function usePermissions() {
    const [users] = useState<User[]>(mockUsers)
    const [roles] = useState<Role[]>(mockRoles)
    const [searchTerm, setSearchTerm] = useState("")

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const getRoleColor = (roleName: string) => {
        const role = roles.find((r) => r.name === roleName)
        return role ? role.color : "bg-gray-100 text-gray-800"
    }

    const getPermissionBadgeColor = (permission: string) => {
        const colors: Record<string, string> = {
            read: "bg-green-100 text-green-800",
            write: "bg-blue-100 text-blue-800",
            delete: "bg-red-100 text-red-800",
            manage_users: "bg-purple-100 text-purple-800",
            manage_roles: "bg-orange-100 text-orange-800",
            moderate: "bg-yellow-100 text-yellow-800",
        }
        return colors[permission] || "bg-gray-100 text-gray-800"
    }

    return {
        users,
        roles,
        filteredUsers,
        searchTerm,
        setSearchTerm,
        getRoleColor,
        getPermissionBadgeColor,
    }
}
