"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react"
import type { RoleType, Permission } from "../constants"
import { getPermissionBadgeColor } from "../constants"
import { useTranslations } from "next-intl"

interface RoleCardProps {
  role: RoleType
  permissions: Permission[]
  name: string
  description: string
  color: string
  onEdit: () => void
}

export function RoleCard({ permissions, name, description, color, onEdit }: RoleCardProps) {
  const t = useTranslations('roles')

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Badge className={`${color} select-none user-select-none pointer-events-none`}>{t(name)}</Badge>
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <CardDescription>{t(description)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">{t('permissions')} ({permissions.length})</p>
            <div className="flex flex-wrap gap-1">
              {permissions.map((permission) => (
                <Badge key={permission} variant="outline" className={`text-xs ${getPermissionBadgeColor(permission)}`}>
                  {permission}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
