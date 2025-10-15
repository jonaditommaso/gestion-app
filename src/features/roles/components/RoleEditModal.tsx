"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { RoleType, Permission } from "../constants"
import { useState } from "react"
import { useUpdateRolePermissions } from "../api/use-update-role-permissions"
import { PERMISSIONS, ROLE_METADATA } from "../constants"
import { useTranslations } from "next-intl"
import { useCreateRolePermissions } from "../api/use-create-role-permissions"

interface RoleEditDialogProps {
  onOpenChange: (open: boolean) => void
  selectedRole: { role: RoleType; permissions: Permission[], $id?: string } | null,
  setSelectedRole: (role: { role: RoleType; permissions: Permission[], $id?: string } | null) => void
}

function RoleEditModal({ onOpenChange, selectedRole, setSelectedRole }: RoleEditDialogProps) {
  const t = useTranslations('roles')
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(selectedRole?.permissions || [])
  const { mutate: updateRolePermissions, isPending: isUpdating } = useUpdateRolePermissions();
  const { mutate: createRolePermissions, isPending: isCreating } = useCreateRolePermissions();

  if (!selectedRole) return null

  const handlePermissionToggle = (permission: Permission) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    )
  }

  const handleSave = () => {
    if (selectedRole.$id) {
      updateRolePermissions({
        param: { roleId: selectedRole.$id },
        json: { permissions: selectedPermissions }
      }, {
        onSuccess: () => {
          onOpenChange(false)
        }
      })
    } else {
      createRolePermissions({
        json: { role: selectedRole.role, permissions: selectedPermissions }
      }, {
        onSuccess: () => {
          onOpenChange(false)
        }
      })
    }
  }

  const handleClose = () => {
    setSelectedRole(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('edit-role')}: <span className={`text-${ROLE_METADATA[selectedRole.role].color}`}>{t(ROLE_METADATA[selectedRole.role].name)}</span></DialogTitle>
          <DialogDescription>{t('edit-role-description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-4 block">{t('permissions')}</label>
            <div className="space-y-3">
              {Object.values(PERMISSIONS).map((permission) => (
                <div key={permission} className="flex items-start space-x-3">
                  <Checkbox
                    id={`role-${permission}`}
                    checked={selectedPermissions.includes(permission)}
                    onCheckedChange={() => handlePermissionToggle(permission)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label htmlFor={`role-${permission}`} className="text-sm font-medium leading-none cursor-pointer">
                      {permission}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isUpdating || isCreating}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isUpdating || isCreating}>
              {isUpdating || isCreating ? t('saving') : t('save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RoleEditModal