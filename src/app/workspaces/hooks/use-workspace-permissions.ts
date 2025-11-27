import { useMemo } from "react";
import { useCurrent } from "@/features/auth/api/use-current";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useWorkspaceId } from "./use-workspace-id";
import { useWorkspaceConfig } from "./use-workspace-config";
import { WorkspaceConfigKey } from "../constants/workspace-config-keys";
import { Models } from "node-appwrite";

// Type for workspace member document
type WorkspaceMemberDocument = Models.Document & {
    userId: string;
    workspaceId: string;
    role: string;
    name: string;
    email: string;
    avatarId?: string;
};

/**
 * Hook to check workspace permissions for the current user
 * Returns permission flags based on workspace config and user role
 */
export const useWorkspacePermissions = () => {
    const { data: user } = useCurrent();
    const workspaceId = useWorkspaceId();
    const { data: members } = useGetMembers({ workspaceId });
    const config = useWorkspaceConfig();

    console.log({ members })

    const permissions = useMemo(() => {
        // Find current user's member record in this workspace
        const currentMember = (members?.documents as WorkspaceMemberDocument[] | undefined)?.find(
            (member) => member.userId === user?.$id
        );

        // Check if user is workspace admin
        const isWorkspaceAdmin = currentMember?.role === 'ADMIN';

        // Get config values
        const taskCreationAdminOnly = config[WorkspaceConfigKey.TASK_CREATION_ADMIN_ONLY] as boolean;
        const deleteTasksAdminOnly = config[WorkspaceConfigKey.DELETE_TASKS_ADMIN_ONLY] as boolean;
        const createColumnsAdminOnly = config[WorkspaceConfigKey.CREATE_COLUMNS_ADMIN_ONLY] as boolean;
        const editColumnsAdminOnly = config[WorkspaceConfigKey.EDIT_COLUMNS_ADMIN_ONLY] as boolean;
        const editLabelsAdminOnly = config[WorkspaceConfigKey.EDIT_LABELS_ADMIN_ONLY] as boolean;
        const inviteMembersAdminOnly = config[WorkspaceConfigKey.INVITE_MEMBERS_ADMIN_ONLY] as boolean;

        // Check if admin mode is active (all permissions are admin-only)
        const isAdminMode = taskCreationAdminOnly &&
            deleteTasksAdminOnly &&
            createColumnsAdminOnly &&
            editColumnsAdminOnly &&
            editLabelsAdminOnly &&
            inviteMembersAdminOnly;

        return {
            // User info
            isWorkspaceAdmin,
            isAdminMode,

            // Individual permissions (true = user CAN perform action)
            canCreateTask: !taskCreationAdminOnly || isWorkspaceAdmin,
            canDeleteTask: !deleteTasksAdminOnly || isWorkspaceAdmin,
            canCreateColumn: !createColumnsAdminOnly || isWorkspaceAdmin,
            canEditColumn: !editColumnsAdminOnly || isWorkspaceAdmin,
            canEditLabel: !editLabelsAdminOnly || isWorkspaceAdmin,
            canInviteMembers: !inviteMembersAdminOnly || isWorkspaceAdmin,
        };
    }, [user, members, config]);

    return permissions;
};
