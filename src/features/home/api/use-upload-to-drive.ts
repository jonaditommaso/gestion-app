import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

type DriveUploadResponse = {
    data: {
        fileId: string;
        viewUrl: string;
        name: string;
        isImage: boolean;
    };
};

export const useUploadToDrive = () => {
    const t = useTranslations('workspaces');

    return useMutation<DriveUploadResponse, Error, File>({
        mutationFn: async (file: File): Promise<DriveUploadResponse> => {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/drive-upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');
            return await res.json() as DriveUploadResponse;
        },
        onSuccess: () => {
            toast.success(t('drive-upload-success'));
        },
        onError: () => {
            toast.error(t('drive-upload-error'));
        }
    });
};
