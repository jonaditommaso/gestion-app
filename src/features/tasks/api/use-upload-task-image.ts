import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { UploadTaskImageRequest, UploadTaskImageResponse } from "../interfaces/upload-image";

export const useUploadTaskImage = () => {
    const mutation = useMutation<UploadTaskImageResponse, Error, UploadTaskImageRequest>({
        mutationFn: async ({ image }) => {
            const formData = new FormData();
            formData.append('image', image);
            // formData.append('workspaceId', workspaceId);

            const response = await fetch('/api/tasks/upload-task-image', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload image');
            }

            return response.json();
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to upload image');
        },
    });

    return mutation;
};
