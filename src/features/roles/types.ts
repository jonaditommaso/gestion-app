import { Models } from "node-appwrite"

export type MemberUser = Models.User<Models.Preferences> & Models.Membership

export type RoleUser = {
    id: string
    name: string
    email: string
    role: string
    permissions: string[]
    status: "active" | "inactive"
}