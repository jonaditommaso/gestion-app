import { Models } from "node-appwrite";

export enum TaskStatus {
    BACKLOG = 'BACKLOG',
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    IN_REVIEW = 'IN_REVIEW',
    DONE = 'DONE',
    CUSTOM = 'CUSTOM'
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
}