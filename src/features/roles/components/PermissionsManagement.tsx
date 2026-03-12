"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Users } from "lucide-react"
import { UsersTab } from "./UsersTab"
import { RolesTab } from "./RolesTab"
import { PermissionsInfoDialog } from "./PermissionsInfoDialog"
import { useTranslations } from "next-intl"
import { useCurrentUserPermissions } from "../hooks/useCurrentUserPermissions"
import { PERMISSIONS } from "../constants"
import { redirect } from "next/navigation"
import FadeLoader from "react-spinners/FadeLoader"

export default function PermissionsManagement() {
  const t = useTranslations('roles')
  const { hasPermission, isLoading } = useCurrentUserPermissions();
  const canManageUsers = hasPermission(PERMISSIONS.MANAGE_USERS);

  if (!isLoading && !canManageUsers) {
    redirect('/');
  }

  if(isLoading) return <div className="flex items-center justify-center">
    <FadeLoader color="#999" width={3} className="mt-5" />
  </div>

  return (
    <div>
      <Tabs defaultValue="users" className="space-y-6">
        <div className="flex justify-between">

          {/* tabs */}
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('users-tab')}
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {t('roles-tab')}
            </TabsTrigger>
          </TabsList>

          {/* actions */}
          <div className="flex gap-2">
            <PermissionsInfoDialog />
          </div>
        </div>

        <TabsContent value="users">
          <UsersTab
            // users={[]}
            // roles={[]}
            // permissions={[]}
            // searchTerm=""
            // onSearchChange={() => {}}
            // getRoleColor={() => ""}
            // getPermissionBadgeColor={() => ""}
          />
        </TabsContent>

        <TabsContent value="roles">
          <RolesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
