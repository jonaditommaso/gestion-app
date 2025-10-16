"use client"

import { FilterUser } from "./FilterUser"
import { UserCard } from "./UserCard"
import { UserPermissionsModal } from "./UserPermissionsModal"
import { useState } from "react"
import type { User, Role, Permission } from "../types"
import { useGetMembers } from "@/features/team/api/use-get-members"

interface UsersTabProps {
  // users: User[]
  // roles: Role[]
  // permissions: Permission[]
  // searchTerm: string
  // onSearchChange: (value: string) => void
  // getRoleColor: (roleName: string) => string
  // getPermissionBadgeColor: (permission: string) => string
}

export function UsersTab({
  // users,
  // roles,
  // permissions,
  // searchTerm,
  // onSearchChange,
  // getRoleColor,
  // getPermissionBadgeColor,
}: UsersTabProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { data: team, isLoading} = useGetMembers();

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
      <FilterUser searchTerm={searchTerm} onSearchChange={onSearchChange} />

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

      <UserPermissionsModal
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={selectedUser}
        roles={roles}
        permissions={permissions}
      />
    </div>
  )
}
