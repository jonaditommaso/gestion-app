"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { User, Role, Permission } from "../types"

interface UserPermissionsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  roles: Role[]
  permissions: Permission[]
}

export function UserPermissionsModal({ isOpen, onOpenChange, user, roles, permissions }: UserPermissionsDialogProps) {
  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Permisos de {user.name}</DialogTitle>
          <DialogDescription>Gestiona los permisos y rol del usuario</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Rol</label>
            <Select defaultValue={user.role.toLowerCase()}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name.toLowerCase()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-4 block">Permisos Individuales</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-start space-x-3">
                  <Checkbox id={permission.id} defaultChecked={user.permissions.includes(permission.id)} />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={permission.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {permission.name}
                    </label>
                    <p className="text-xs text-muted-foreground">{permission.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={() => onOpenChange(false)}>Guardar Cambios</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
