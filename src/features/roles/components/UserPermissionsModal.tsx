"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { RoleUser } from "../types"
import { useGetFinalRolesPermissions } from "../hooks/useGetFinalRolesPermissions"
import { useState } from "react"
import { useUpdateUserRole } from "../api/use-update-user-role"

interface UserPermissionsDialogProps {
  onOpenChange: (open: boolean) => void
  user: RoleUser
}

export function UserPermissionsModal({ onOpenChange, user }: UserPermissionsDialogProps) {

  const finalRolePermissions = useGetFinalRolesPermissions();
  const [roleSelected, setRoleSelected] = useState<string>(user.role.toLowerCase());

  const { mutate: updateUserRole, isPending: isUpdating } = useUpdateUserRole();

  const permissions = finalRolePermissions.find(({role}) => role.toLowerCase() === roleSelected)?.permissions || [];

  const handleSave = () => {
    updateUserRole({
      param: { id: user.id },
      json: { role: roleSelected.toUpperCase() }
    }, {
        onSuccess: () => {
          onOpenChange(false)
        }
      })
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[350px]">
        <DialogHeader>
          <DialogTitle>Permisos de {user.name}</DialogTitle>
          <DialogDescription>Gestiona los permisos y rol del usuario</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Rol</label>
            <Select defaultValue={user.role.toLowerCase()} onValueChange={(value) => setRoleSelected(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {finalRolePermissions.map(({role}) => (
                  <SelectItem key={role} value={role.toLowerCase()}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="h-24">
            <label className="text-sm font-medium mb-4 block">Permisos Individuales</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {permissions.map(permission => (
                <div key={permission} className="flex items-start space-x-3">
                  <Checkbox id={permission} defaultChecked={user.permissions.includes(permission)} disabled />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={permission}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {permission}
                    </label>
                    {/* <p className="text-xs text-muted-foreground">{permission.description}</p> */}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">

            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isUpdating}>Guardar Cambios</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
