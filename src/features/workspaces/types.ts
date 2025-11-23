import { Models } from "node-appwrite";

export type WorkspaceType = Models.Document & {
    name: string,
    inviteCode: string,
    userId: string,
    description?: string,
    metadata?: string
}