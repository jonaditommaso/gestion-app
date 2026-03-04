import { Models } from "node-appwrite";

/**
 * Deal activity log action types
 */
export enum DealActivityAction {
    DEAL_STAGE_UPDATED = "DEAL_STAGE_UPDATED",       // deal moved between stages
    DEAL_TITLE_UPDATED = "DEAL_TITLE_UPDATED",       // title/name changed
    DESCRIPTION_UPDATED = "DESCRIPTION_UPDATED",     // description changed
    COMMENT_UPDATED = "COMMENT_UPDATED",             // comment added/edited/deleted
    PRIORITY_UPDATED = "PRIORITY_UPDATED",           // priority 1-3 changed
    CLOSE_DATE_UPDATED = "CLOSE_DATE_UPDATED",       // expectedCloseDate changed
    ASSIGNEES_UPDATED = "ASSIGNEES_UPDATED",         // assignee added/removed
    AMOUNT_UPDATED = "AMOUNT_UPDATED",               // amount or currency changed
    NEXT_STEP_UPDATED = "NEXT_STEP_UPDATED",         // next step text changed
    COMPANY_UPDATED = "COMPANY_UPDATED",             // company / responsible contact changed
    DEAL_CREATED = "DEAL_CREATED",                   // deal first created
}

/**
 * Sub-actions for more specific activity tracking
 */
export enum DealActivitySubAction {
    // Comment sub-actions
    COMMENT_CREATED = "created",
    COMMENT_EDITED = "edited",
    COMMENT_DELETED = "deleted",
    // Assignee sub-actions
    ASSIGNEE_ADDED = "added",
    ASSIGNEE_REMOVED = "removed",
    // Generic
    SET = "set",
    CLEARED = "cleared",
}

// ── Payload types ─────────────────────────────────────────────────────────────

export interface DealStageUpdatedPayload {
    from: string;
    to: string;
}

export interface DealTitleUpdatedPayload {
    from: string;
    to: string;
}

export interface DescriptionUpdatedPayload {
    subAction: "set" | "cleared";
}

export interface CommentUpdatedPayload {
    subAction: "created" | "edited" | "deleted";
    commentId: string;
}

export interface PriorityUpdatedPayload {
    from: number;
    to: number;
}

export interface CloseDateUpdatedPayload {
    from: string | null;
    to: string | null;
}

export interface AssigneesUpdatedPayload {
    subAction: "added" | "removed";
    memberId: string;
    memberName: string;
}

export interface AmountUpdatedPayload {
    from: number;
    to: number;
    currency: string;
}

export interface NextStepUpdatedPayload {
    subAction: "set" | "cleared";
}

export interface CompanyUpdatedPayload {
    field: "company" | "companyResponsabileName" | "companyResponsabileEmail" | "companyResponsabilePhoneNumber";
    from: string | null;
    to: string | null;
}

export interface DealCreatedPayload {
    title: string;
}

export type DealActivityPayload =
    | DealStageUpdatedPayload
    | DealTitleUpdatedPayload
    | DescriptionUpdatedPayload
    | CommentUpdatedPayload
    | PriorityUpdatedPayload
    | CloseDateUpdatedPayload
    | AssigneesUpdatedPayload
    | AmountUpdatedPayload
    | NextStepUpdatedPayload
    | CompanyUpdatedPayload
    | DealCreatedPayload;

/**
 * Activity log document type (as stored in Appwrite)
 */
export type DealActivityLog = Models.Document & {
    dealId: string;
    actorMemberId: string;
    action: DealActivityAction;
    payload: string; // JSON stringified DealActivityPayload
};

/**
 * Parsed activity log with typed payload
 */
export interface ParsedDealActivityLog extends Omit<DealActivityLog, "payload"> {
    payload: DealActivityPayload;
}
