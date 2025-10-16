"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Trash2, Eye } from "lucide-react"
import type { User } from "../types"

interface UserCardProps {
  user: User
  getRoleColor: (roleName: string) => string
  getPermissionBadgeColor: (permission: string) => string
  onViewPermissions: (user: User) => void
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export function UserCard({
  user,
  getRoleColor,
  getPermissionBadgeColor,
  onViewPermissions,
  onEdit,
  onDelete,
}: UserCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{user.name}</h3>
                {/* <Badge variant={user.status === "active" ? "default" : "secondary"}>
                  {user.status === "active" ? "Activo" : "Inactivo"}
                </Badge> */}
              </div>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                <div className="flex flex-wrap gap-1">
                  {user.permissions.slice(0, 3).map((permission) => (
                    <Badge
                      key={permission}
                      variant="outline"
                      className={`text-xs ${getPermissionBadgeColor(permission)}`}
                    >
                      {permission}
                    </Badge>
                  ))}
                  {user.permissions.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{user.permissions.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {/* <Button variant="outline" size="sm" onClick={() => onViewPermissions(user)}>
              <Eye className="w-4 h-4" />
            </Button> */}
            <Button variant="outline" size="sm" onClick={() => onViewPermissions(user)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 bg-transparent"
              onClick={() => onDelete(user)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
