export type Message = {
    content: string;
    toTeamMemberId: string;
    fromTeamMemberId: string;
    teamId: string;
    read: boolean;
    $createdAt: string;
    $id: string;
    $collectionId: string;
    $databaseId: string;
    $updatedAt: string;
    $permissions: string[];
};