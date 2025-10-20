"use client"

import { FilterUser } from "./FilterUser"
import { UserCard } from "./UserCard"
import { UserPermissionsModal } from "./UserPermissionsModal"
import { useMemo, useState } from "react"
import { useGetMembers } from "@/features/team/api/use-get-members"
import { getRoleColor, getPermissionBadgeColor, type RoleType } from "../constants"
import { useGetFinalRolesPermissions } from "../hooks/useGetFinalRolesPermissions"
import FadeLoader from "react-spinners/FadeLoader"
import { MemberUser, RoleUser } from "../types"
import { useTranslations } from "next-intl"

export function UsersTab() {
  const t = useTranslations('roles')
  const [selectedUser, setSelectedUser] = useState<RoleUser | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { data: team, isLoading } = useGetMembers()
  const finalRolePermissions = useGetFinalRolesPermissions();

  // TODO: update automatically users list when a user's role is changed. Check useUpdateUserRole

  // Filtrar usuarios por término de búsqueda
  const filteredUsers = useMemo(() => {
    if (!team) return []

    if (!searchTerm) return team

    const search = searchTerm.toLowerCase()
    return team.filter((member) =>
      member.userName.toLowerCase().includes(search) ||
      member.userEmail.toLowerCase().includes(search) ||
      (member.prefs?.role as string)?.toLowerCase().includes(search)
    )
  }, [team, searchTerm])

  const handleViewPermissions = (user: RoleUser) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  if(isLoading) return <FadeLoader color="#999" width={3} className="mt-5" />

  return (
    <div className="space-y-6">
      <FilterUser searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <div className="grid gap-4">
        {filteredUsers.map((user: MemberUser) => {

          const role = (user.prefs?.role as RoleType) || 'VIEWER'
          const roleConfig = finalRolePermissions.find(r => r.role === role)
          const permissions = roleConfig?.permissions || []

          const roleUser = {
            id: user.userId,
            name: user.name,
            email: user.email,
            role: role,
            permissions: permissions,
            status: user.status ? "active" : "inactive",
          } as const

          return (
            <UserCard
              key={user.$id}
              user={roleUser}
              getRoleColor={(roleName: string) => getRoleColor(roleName as RoleType)}
              getPermissionBadgeColor={getPermissionBadgeColor}
              onViewPermissions={() => handleViewPermissions(roleUser)}
            />
          )
        })}
      </div>

      {!filteredUsers.length && (
        <div className="text-center text-muted-foreground py-8">
          {t('no-users-found')}
        </div>
      )}

      {selectedUser && isEditDialogOpen && (
        <UserPermissionsModal
          onOpenChange={setIsEditDialogOpen}
          user={selectedUser}
        />
      )}
    </div>
  )
}
