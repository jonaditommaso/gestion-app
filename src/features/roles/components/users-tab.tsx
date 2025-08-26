"use client"

import { SearchAndFilters } from "./search-and-filters"
import { UserCard } from "./user-card"
import { UserPermissionsDialog } from "./user-permissions-dialog"
import { useState } from "react"
import type { User, Role, Permission } from "../types"

interface UsersTabProps {
  users: User[]
  roles: Role[]
  permissions: Permission[]
  searchTerm: string
  onSearchChange: (value: string) => void
  getRoleColor: (roleName: string) => string
  getPermissionBadgeColor: (permission: string) => string
}

export function UsersTab({
  users,
  roles,
  permissions,
  searchTerm,
  onSearchChange,
  getRoleColor,
  getPermissionBadgeColor,
}: UsersTabProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleViewPermissions = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleEdit = (user: User) => {
    console.log("Edit user:", user)
  }

  const handleDelete = (user: User) => {
    console.log("Delete user:", user)
  }

  return (
    <div className="space-y-6">
      <SearchAndFilters searchTerm={searchTerm} onSearchChange={onSearchChange} />

      <div className="grid gap-4">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            getRoleColor={getRoleColor}
            getPermissionBadgeColor={getPermissionBadgeColor}
            onViewPermissions={handleViewPermissions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <UserPermissionsDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={selectedUser}
        roles={roles}
        permissions={permissions}
      />
    </div>
  )
}
