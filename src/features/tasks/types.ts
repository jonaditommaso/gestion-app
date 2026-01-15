import { Models } from "node-appwrite";

export enum TaskStatus {
    BACKLOG = 'BACKLOG',
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    IN_REVIEW = 'IN_REVIEW',
    DONE = 'DONE',
    CUSTOM = 'CUSTOM'
};

export enum TaskShareType {
    INTERNAL = 'INTERNAL',
    EXTERNAL = 'EXTERNAL'
};

export type TaskMetadata = {
    imageIds?: string[];
    // Aquí podemos agregar más campos en el futuro:
    // attachments?: string[];
    // mentions?: string[];
    // tags?: string[];
}

export type WorkspaceMember = Models.Document & {
    userId: string,
    workspaceId: string,
    role: string,
    name: string,
    email: string,
    avatarId?: string,
}

export type Task = Models.Document & {
    name: string,
    status: TaskStatus,
    statusCustomId?: string, // ID del custom status cuando status === 'CUSTOM'
    assignees?: WorkspaceMember[],
    position: number,
    dueDate: string,
    workspaceId: string,
    description?: string,
    featured?: boolean,
    label?: string,
    type?: string,
    metadata?: string, // JSON stringified TaskMetadata
    checklistCount?: number, // Total checklist items
    checklistCompletedCount?: number, // Completed checklist items
    checklistTitle?: string, // Title of the checklist
}

export type TaskShare = Models.Document & {
    taskId: string,
    workspaceId: string,
    token?: string,
    expiresAt?: string,
    type: TaskShareType,
    sharedBy: string,
    sharedTo?: string,
    readOnly: boolean,
}

export type TaskComment = Models.Document & {
    taskId: string,
    authorMemberId: string,
    content: string,
    // Populated fields
    author?: WorkspaceMember,
}