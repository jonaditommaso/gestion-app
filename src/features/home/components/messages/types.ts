export type Message = {
    subject?: string;
    content: string;
    toTeamMemberId: string;
    fromTeamMemberId: string;
    teamId: string;
    read: boolean;
    featured?: boolean;
    deletedByRecipient?: boolean;
    deletedBySender?: boolean;
    $createdAt: string;
    $id: string;
    $collectionId: string;
    $databaseId: string;
    $updatedAt: string;
    $permissions: string[];
};