import { Databases, ID } from "node-appwrite";
import { DATABASE_ID, TASK_ACTIVITY_LOGS_ID } from "@/config";
import { ActivityAction, ActivityPayload } from "../types/activity-log";

interface CreateActivityLogParams {
    databases: Databases;
    taskId: string;
    actorMemberId: string;
    action: ActivityAction;
    payload: ActivityPayload;
}

/**
 * Creates an activity log entry for a task action.
 * This should be called whenever an action occurs that we want to track.
 */
export const createActivityLog = async ({
    databases,
    taskId,
    actorMemberId,
    action,
    payload
}: CreateActivityLogParams): Promise<void> => {
    try {
        await databases.createDocument(
            DATABASE_ID,
            TASK_ACTIVITY_LOGS_ID,
            ID.unique(),
            {
                taskId,
                actorMemberId,
                action,
                payload: JSON.stringify(payload)
            }
        );
    } catch (error) {
        // Log error but don't throw - activity logging should not break the main operation
        console.error('Failed to create activity log:', error);
    }
};

/**
 * Creates multiple activity logs in parallel.
 * Useful when multiple changes happen at once.
 */
export const createMultipleActivityLogs = async (
    databases: Databases,
    logs: Omit<CreateActivityLogParams, 'databases'>[]
): Promise<void> => {
    try {
        await Promise.all(
            logs.map(log => createActivityLog({ databases, ...log }))
        );
    } catch (error) {
        console.error('Failed to create activity logs:', error);
    }
};
