"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, Trash2 } from "lucide-react"
import type { Role } from "../types"

interface RoleCardProps {
  role: Role
  getPermissionBadgeColor: (permission: string) => string
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
  onViewUsers: (role: Role) => void
}

export function RoleCard({ role, getPermissionBadgeColor, onEdit, onDelete, onViewUsers }: RoleCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Badge className={role.color}>{role.name}</Badge>
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(role)}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete(role)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <CardDescription>{role.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Permisos ({role.permissions.length})</p>
            <div className="flex flex-wrap gap-1">
              {role.permissions.map((permission) => (
                <Badge key={permission} variant="outline" className={`text-xs ${getPermissionBadgeColor(permission)}`}>
                  {permission}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{role.users} usuarios asignados</span>
            <Button variant="outline" size="sm" onClick={() => onViewUsers(role)}>
              Ver Usuarios
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
