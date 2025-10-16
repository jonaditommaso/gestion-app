"use client"

import { RoleCard } from "./RoleCard"
import RoleEditModal from "./RoleEditModal"
import { useMemo, useState } from "react"
import type { RoleType, Permission } from "../constants"
import {
  ROLE_METADATA,
  rolePermissions
} from "../constants"
import { useGetRolesPermissions } from "../api/use-get-role-permissions"

export function RolesTab() {
  const [selectedRole, setSelectedRole] = useState<{ role: RoleType; permissions: Permission[], $id?: string } | null>(null)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const { data: customRolePermissions } = useGetRolesPermissions();

  const finalRolePermissions = useMemo(() => rolePermissions.map(defaultRole => {
    const customConfig = customRolePermissions?.documents?.find(custom => custom.role === defaultRole.role);

    if (customConfig) {
      return {
        role: customConfig.role as RoleType,
        permissions: customConfig.permissions as Permission[],
        $id: customConfig.$id
      };
    }
    return defaultRole;
  }), [customRolePermissions]);

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
