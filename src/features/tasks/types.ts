import { Models } from "node-appwrite";

export enum TaskStatus {
    BACKLOG = 'BACKLOG',
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    IN_REVIEW = 'IN_REVIEW',
    DONE = 'DONE'
};

export type TaskMetadata = {
    imageIds?: string[];
    // Aquí podemos agregar más campos en el futuro:
    // attachments?: string[];
    // mentions?: string[];
    // tags?: string[];
}

export type Task = Models.Document & {
    name: string,
    status: TaskStatus,
    assignees?: Array<{
        $id: string,
        name: string,
        email: string,
        avatarId?: string,
    }>,
    position: number,
    dueDate: string,
    workspaceId: string,
    description?: string,
    featured?: boolean,
    label?: string,
    type?: string,
    metadata?: string, // JSON stringified TaskMetadata
}