export interface User {
    id: number
    name: string
    email: string
    avatar: string
    role: string
    permissions: string[]
    status: "active" | "inactive"
}

export interface Role {
    id: number
    name: string
    description: string
    permissions: string[]
    color: string
    users: number
}

export interface Permission {
    id: string
    name: string
    description: string
}
