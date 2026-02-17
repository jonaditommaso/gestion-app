import { DEFAULT_WORKSPACE_CONFIG, WorkspaceConfigKey } from "@/app/workspaces/constants/workspace-config-keys";
import { DATABASE_ID, MEMBERS_ID, NOTIFICATIONS_ID, TASK_ASSIGNEES_ID, WORKSPACES_ID } from "@/config";
import { Task, WorkspaceMember } from "@/features/tasks/types";
import { WorkspaceType } from "@/features/workspaces/types";
import { Databases, ID, Models, Query } from "node-appwrite";
import { NotificationBodySeparator, NotificationEntity, NotificationI18nKey, NotificationType } from "./types";

interface TaskAssignee extends Models.Document {
    taskId: string;
    workspaceMemberId: string;
}

export const chunkArray = <T>(items: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];

    for (let index = 0; index < items.length; index += chunkSize) {
        chunks.push(items.slice(index, index + chunkSize));
    }

    return chunks;
};

export const getWorkspaceNotificationSetting = async (
    databases: Databases,
    workspaceId: string,
    key: WorkspaceConfigKey
): Promise<boolean> => {
    try {
        const workspace = await databases.getDocument<WorkspaceType>(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        );

        const metadata = workspace.metadata
            ? (typeof workspace.metadata === 'string'
                ? JSON.parse(workspace.metadata)
                : workspace.metadata)
            : {};

        const mergedConfig = {
            ...DEFAULT_WORKSPACE_CONFIG,
            ...(metadata as Record<string, unknown>)
        };

        return mergedConfig[key] === true;
    } catch {
        return DEFAULT_WORKSPACE_CONFIG[key] === true;
    }
};

export const shouldNotifyTaskAssignment = async (databases: Databases, workspaceId: string): Promise<boolean> => {
    return getWorkspaceNotificationSetting(databases, workspaceId, WorkspaceConfigKey.NOTIFY_TASK_ASSIGNMENT);
};

export const shouldNotifyDueDateReminder = async (workspaceId: string, databases: Databases): Promise<boolean> => {
    return getWorkspaceNotificationSetting(databases, workspaceId, WorkspaceConfigKey.NOTIFY_DUE_DATE_REMINDER);
};

export const notifyTaskAssignees = async ({
    databases,
    task,
    actorUserId,
    title,
    entityType,
}: {
    databases: Databases;
    task: Task;
    actorUserId: string;
    title: string;
    entityType: string;
}) => {
    const taskAssignees = await databases.listDocuments<TaskAssignee>(
        DATABASE_ID,
        TASK_ASSIGNEES_ID,
        [Query.equal('taskId', task.$id), Query.limit(5000)]
    );

    const memberIds = [...new Set(taskAssignees.documents.map((assignee) => assignee.workspaceMemberId))];

    if (memberIds.length === 0) {
        return;
    }

    const assignees = await databases.listDocuments<WorkspaceMember>(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.contains('$id', memberIds), Query.limit(5000)]
    );

    const recipients = assignees.documents.filter((assignee) => assignee.userId && assignee.userId !== actorUserId);

    if (recipients.length === 0) {
        return;
    }

    await Promise.all(
        recipients.map((assignee) =>
            databases.createDocument(
                DATABASE_ID,
                NOTIFICATIONS_ID,
                ID.unique(),
                {
                    userId: assignee.userId,
                    triggeredBy: actorUserId,
                    title,
                    read: false,
                    type: NotificationType.RECURRING,
                    entityType,
                    body: `${NotificationI18nKey.VIEW_TASK_LINK}${NotificationBodySeparator}/${NotificationEntity.WORKSPACES}/${task.workspaceId}/${NotificationEntity.TASKS}/${task.$id}`,
                }
            )
        )
    );
};

export const extractMentionedMemberIds = (content: string | null | undefined): string[] => {
    if (!content) {
        return [];
    }

    const mentionRegex = /data-mention-id=["']([^"']+)["']/g;
    const memberIds = new Set<string>();
    let match = mentionRegex.exec(content);

    while (match) {
        const memberId = match[1]?.trim();
        if (memberId) {
            memberIds.add(memberId);
        }
        match = mentionRegex.exec(content);
    }

    return [...memberIds];
};

export const notifyMentionedMembers = async ({
    databases,
    workspaceId,
    taskId,
    actorUserId,
    memberIds,
    title,
    entityType,
}: {
    databases: Databases;
    workspaceId: string;
    taskId: string;
    actorUserId: string;
    memberIds: string[];
    title: string;
    entityType: string;
}) => {
    const uniqueMemberIds = [...new Set(memberIds.filter(Boolean))];

    if (uniqueMemberIds.length === 0) {
        return;
    }

    const members = await databases.listDocuments<WorkspaceMember>(
        DATABASE_ID,
        MEMBERS_ID,
        [
            Query.equal('workspaceId', workspaceId),
            Query.contains('$id', uniqueMemberIds),
            Query.limit(5000),
        ]
    );

    const recipients = members.documents.filter((member) => member.userId && member.userId !== actorUserId);

    if (recipients.length === 0) {
        return;
    }

    await Promise.all(
        recipients.map((recipient) =>
            databases.createDocument(
                DATABASE_ID,
                NOTIFICATIONS_ID,
                ID.unique(),
                {
                    userId: recipient.userId,
                    triggeredBy: actorUserId,
                    title,
                    read: false,
                    type: NotificationType.RECURRING,
                    entityType,
                    body: `${NotificationI18nKey.VIEW_TASK_LINK}${NotificationBodySeparator}/${NotificationEntity.WORKSPACES}/${workspaceId}/${NotificationEntity.TASKS}/${taskId}`,
                }
            )
        )
    );
};
