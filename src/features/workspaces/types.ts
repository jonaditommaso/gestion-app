import { Models } from "node-appwrite";

export type WorkspaceType = Models.Document & {
    name: string,
    inviteCode: string,
    description?: string,
    metadata?: string
}