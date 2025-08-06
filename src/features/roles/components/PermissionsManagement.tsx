"use client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, Plus, Shield, Users } from "lucide-react"
import { usePermissions } from "../hooks/use-permissions"
import { UsersTab } from "./users-tab"
import { RolesTab } from "./RolesTab"
import { allPermissions } from "../constants"

export default function PermissionsManagement() {
  const { roles, filteredUsers, searchTerm, setSearchTerm, getRoleColor, getPermissionBadgeColor } = usePermissions()

  return (
    <div>
      <Tabs defaultValue="users" className="space-y-6">
        <div className="flex justify-between">

          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Roles
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Info />
            </Button>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo permiso
            </Button>
            <Button>
              <Shield className="w-4 h-4 mr-2" />
              Nuevo rol
            </Button>
          </div>
        </div>

        <TabsContent value="users">
          <UsersTab
            users={filteredUsers}
            roles={roles}
            permissions={allPermissions}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            getRoleColor={getRoleColor}
            getPermissionBadgeColor={getPermissionBadgeColor}
          />
        </TabsContent>

        <TabsContent value="roles">
          <RolesTab roles={roles} permissions={allPermissions} getPermissionBadgeColor={getPermissionBadgeColor} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
