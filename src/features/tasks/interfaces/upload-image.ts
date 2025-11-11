export interface UploadTaskImageRequest {
    image: File;
    // workspaceId: string;
}

export interface UploadTaskImageResponse {
    success: boolean;
    data?: {
        fileId: string;
        url: string;
    };
    error?: string;
}