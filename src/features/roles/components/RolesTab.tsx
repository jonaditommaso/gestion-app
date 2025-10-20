"use client"

import { RoleCard } from "./RoleCard"
import RoleEditModal from "./RoleEditModal"
import { useState } from "react"
import type { RoleType, Permission } from "../constants"
import { ROLE_METADATA } from "../constants"
import { useGetFinalRolesPermissions } from "../hooks/useGetFinalRolesPermissions"

export function RolesTab() {
  const [selectedRole, setSelectedRole] = useState<{ role: RoleType; permissions: Permission[], $id?: string } | null>(null)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  const finalRolePermissions = useGetFinalRolesPermissions();

  const handleEdit = (roleData: { role: RoleType; permissions: Permission[], $id?: string }) => {
    setSelectedRole(roleData)
    setIsRoleDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {isRoleDialogOpen && <RoleEditModal
        onOpenChange={setIsRoleDialogOpen}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
      />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {finalRolePermissions.map((roleData) => (
          <RoleCard
            key={roleData.role}
            role={roleData.role}
            permissions={roleData.permissions}
            name={ROLE_METADATA[roleData.role].name}
            description={ROLE_METADATA[roleData.role].description}
            color={ROLE_METADATA[roleData.role].color}
            onEdit={() => handleEdit(roleData)}
          />
        ))}
      </div>
    </div>
  )
}
