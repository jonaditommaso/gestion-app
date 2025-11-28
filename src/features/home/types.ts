export interface NoteData {
    $id: string;
    title?: string;
    content: string;
    bgColor: string;
    userId: string;
    $collectionId: string;
    $databaseId: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
}
