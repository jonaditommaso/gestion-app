"use client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, Plus, Shield, Users } from "lucide-react"
import { usePermissions } from "../hooks/use-permissions"
import { UsersTab } from "./users-tab"
import { RolesTab } from "./roles-tab"
import { allPermissions } from "../constants"

const mockUsers = [
  {
    id: 1,
    name: "Ana García",
    email: "ana.garcia@company.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Admin",
    permissions: ["read", "write", "delete", "manage_users"],
    status: "active",
  },
  {
    id: 2,
    name: "Carlos López",
    email: "carlos.lopez@company.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Editor",
    permissions: ["read", "write"],
    status: "active",
  },
  {
    id: 3,
    name: "María Rodríguez",
    email: "maria.rodriguez@company.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Viewer",
    permissions: ["read"],
    status: "inactive",
  },
  {
    id: 4,
    name: "David Martín",
    email: "david.martin@company.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Moderator",
    permissions: ["read", "write", "moderate"],
    status: "active",
  },
]

const mockRoles = [
  {
    id: 1,
    name: "Admin",
    description: "Acceso completo al sistema",
    permissions: ["read", "write", "delete", "manage_users", "manage_roles"],
    color: "bg-red-100 text-red-800",
    users: 1,
  },
  {
    id: 2,
    name: "Editor",
    description: "Puede crear y editar contenido",
    permissions: ["read", "write"],
    color: "bg-blue-100 text-blue-800",
    users: 3,
  },
  {
    id: 3,
    name: "Viewer",
    description: "Solo lectura",
    permissions: ["read"],
    color: "bg-green-100 text-green-800",
    users: 5,
  },
  {
    id: 4,
    name: "Moderator",
    description: "Puede moderar contenido",
    permissions: ["read", "write", "moderate"],
    color: "bg-purple-100 text-purple-800",
    users: 2,
  },
]

export default function PermissionsManagement() {
  const { roles, filteredUsers, searchTerm, setSearchTerm, getRoleColor, getPermissionBadgeColor } = usePermissions()

  return (
    <div>
      {/* Header */}


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

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Permisos</h1>
          <p className="text-muted-foreground">Administra usuarios, roles y permisos del sistema</p>
        </div> */}

      </div>
    </div>
  )
}
