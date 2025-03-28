import { Query } from "node-appwrite"
import { DATABASE_ID, MEMBERS_ID } from "@/config"
import { WORKSPACES_ID } from '../../config';
import { getMember } from "./members/utils";
import { WorkspaceType } from "./types";
import { createSessionClient } from "@/lib/appwrite";

interface GetWorkspaceProps {
    workspaceId: string
}

export const getWorkspaces = async () => {

    try {
        const { databases, account } = await createSessionClient()
        const user = await account.get();

        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal('userId', user.$id)]
        );

        if(members.total === 0) {
            return { documents: [], total: 0 }
        }

        const workspacesIds = members.documents.map(member => member.workspaceId)

        const workspaces = await databases.listDocuments(
            DATABASE_ID,
            WORKSPACES_ID,
            [
                Query.orderDesc('$createdAt'),
                Query.contains('$id', workspacesIds)
            ]
        );

        return workspaces;

    } catch {
        return { documents: [], total: 0 };
    }

}


export const getWorkspace = async ({ workspaceId}: GetWorkspaceProps) => {
    try {
        const { databases, account } = await createSessionClient()
        const user = await account.get();

        const member = await getMember({
            databases,
            userId: user.$id,
            workspaceId
        });

        if(!member) return null;

        const workspace = await databases.getDocument<WorkspaceType>(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        );

        return workspace;

    } catch {
        return null;
    }

}

export const getWorkspaceInfo = async ({ workspaceId}: GetWorkspaceProps) => {
    try {
        const { databases } = await createSessionClient()

        const workspace = await databases.getDocument<WorkspaceType>(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        );

        return {
            name: workspace.name
        };

    } catch {
        return null;
    }

}