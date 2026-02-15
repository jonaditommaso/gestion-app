export interface NoteData {
    $id: string;
    title?: string;
    content: string;
    bgColor: string;
    isModern?: boolean;
    hasLines?: boolean;
    isPinned?: boolean;
    pinnedAt?: string | null;
    isGlobal?: boolean;
    globalAt?: string | null;
    userId: string;
    $collectionId: string;
    $databaseId: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
}
