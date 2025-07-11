"use client"

import { RoleCard } from "./role-card"
import { RoleEditDialog } from "./role-edit-dialog"
import { useState } from "react"
import type { Role, Permission } from "../types"

interface RolesTabProps {
  roles: Role[]
  permissions: Permission[]
  getPermissionBadgeColor: (permission: string) => string
}

export function RolesTab({ roles, permissions, getPermissionBadgeColor }: RolesTabProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)

  const handleEdit = (role: Role) => {
    setSelectedRole(role)
    setIsRoleDialogOpen(true)
  }

  const handleDelete = (role: Role) => {
    console.log("Delete role:", role)
  }

  const handleViewUsers = (role: Role) => {
    console.log("View users for role:", role)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            getPermissionBadgeColor={getPermissionBadgeColor}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewUsers={handleViewUsers}
          />
        ))}
      </div>

      <RoleEditDialog
        isOpen={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        role={selectedRole}
        permissions={permissions}
      />
    </div>
  )
}
