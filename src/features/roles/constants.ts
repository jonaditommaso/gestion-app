import type { User, Role, Permission } from "./types"

export const mockUsers: User[] = [
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

export const mockRoles: Role[] = [
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

export const allPermissions: Permission[] = [
    { id: "read", name: "Lectura", description: "Ver contenido" },
    { id: "write", name: "Escritura", description: "Crear y editar contenido" },
    { id: "delete", name: "Eliminar", description: "Eliminar contenido" },
    { id: "manage_users", name: "Gestionar Usuarios", description: "Administrar usuarios del sistema" },
    { id: "manage_roles", name: "Gestionar Roles", description: "Administrar roles y permisos" },
    { id: "moderate", name: "Moderar", description: "Moderar contenido y comentarios" },
]
