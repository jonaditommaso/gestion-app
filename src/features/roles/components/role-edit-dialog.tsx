"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Role, Permission } from "../types"

interface RoleEditDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  permissions: Permission[]
}

export function RoleEditDialog({ isOpen, onOpenChange, role, permissions }: RoleEditDialogProps) {
  if (!role) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Rol: {role.name}</DialogTitle>
          <DialogDescription>Modifica los permisos de este rol</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Nombre del Rol</label>
            <Input defaultValue={role.name} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Descripción</label>
            <Input defaultValue={role.description} />
          </div>
          <div>
            <label className="text-sm font-medium mb-4 block">Permisos</label>
            <div className="space-y-3">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-start space-x-3">
                  <Checkbox id={`role-${permission.id}`} defaultChecked={role.permissions.includes(permission.id)} />
                  <div className="grid gap-1.5 leading-none">
                    <label htmlFor={`role-${permission.id}`} className="text-sm font-medium leading-none">
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
            <Button onClick={() => onOpenChange(false)}>Guardar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
