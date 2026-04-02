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

export type SpikeFinding = {
    id: string;
    content: string; // HTML rich text
    createdAt: string; // ISO timestamp
};

export type TestCaseStatus = 'pending' | 'pass' | 'fail';

export type TestCase = {
    id: string;
    name: string;
    status: TestCaseStatus;
};

export type TestScenario = {
    id: string;
    name: string;
    cases: TestCase[];
    collapsed?: boolean;
};

export type TaskMetadata = {
    imageIds?: string[];
    spikeFindings?: SpikeFinding[]; // timeline of findings from spike investigation
    spikeConclusion?: string; // HTML rich text - conclusion from spike investigation
    spikeConclusionType?: 'adopt' | 'reject' | 'investigate'; // outcome type of the spike
    testScenarios?: TestScenario[]; // suites of test cases for test type tasks
    isTdd?: boolean; // whether this test was written before (TDD) or after development
    bugExpected?: string; // HTML rich text - expected behavior
    bugActual?: string; // HTML rich text - actual/current behavior
    bugRootCause?: string; // plain text - root cause explanation after resolution
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
    completedAt?: string, // Date when task was completed
    parentId?: string, // ID of the parent task (for subtasks of epics)
    priority?: number, // Task priority (1-5)
    archived?: boolean, // Whether the task is archived
    archivedBy?: string, // ID of the member who archived the task
    archivedAt?: string, // Date when task was archived
    linkedTaskId?: string, // ID of the task this task originated from (e.g., spike that led to this task)
    squads?: TaskSquad[], // Populated: squads assigned to this task
}

export type TaskSquad = Models.Document & {
    name: string;
    workspaceId: string;
    createdByMemberId: string;
    leadMemberId?: string;
    metadata?: string | null;
    // Populated fields
    members?: WorkspaceMember[];
    leadMember?: WorkspaceMember;
}

export type TaskSquadMember = Models.Document & {
    squadId: string;
    memberId: string;
}

export type TaskSquadAssignee = Models.Document & {
    taskId: string;
    squadId: string;
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