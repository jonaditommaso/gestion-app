export type Message = {
    content: string;
    to: string;
    read: boolean;
    $createdAt: string;
    $id: string;
    $collectionId: string;
    $databaseId: string;
    $updatedAt: string;
    $permissions: string[];
};