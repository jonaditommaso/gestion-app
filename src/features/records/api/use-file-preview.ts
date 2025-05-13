import { useEffect, useMemo, useState } from "react";
import { useGetFiles } from "./use-get-files";

type FilePreview = {
    id: string;
    url: string;
    type: string;
    name: string
};

export const useFilePreviewsFromIds = () => {
    const { data } = useGetFiles();
    const bucketIds = useMemo(() => data?.documents?.map(doc => doc.bucketFileId) ?? [], [data]);

    const [previews, setPreviews] = useState<FilePreview[] | undefined>(undefined);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        if (!bucketIds || bucketIds.length === 0 || previews) return;

        const fetchFiles = async () => {
            setIsPending(true);

            try {
                const files = await Promise.all(
                    bucketIds.map(async (id) => {
                        const response = await fetch(`/api/records/record-file/${id}`);
                        if (!response.ok) throw new Error(`Error al obtener archivo ${id}`);

                        const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
                        const fileName = response.headers.get('Content-Disposition') || ''
                        const arrayBuffer = await response.arrayBuffer();
                        const blob = new Blob([arrayBuffer], { type: contentType });
                        const url = URL.createObjectURL(blob);

                        return { id, url, type: blob.type, name: fileName };
                    })
                );

                setPreviews(files);
            } catch (err) {
                console.error('Error trayendo archivos:', err);
            } finally {
                setIsPending(false);
            }
        };

        fetchFiles();
    }, [bucketIds, previews]);

    return { previews, isPending };
};
