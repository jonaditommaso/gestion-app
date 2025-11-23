import { useState } from "react";

export const useHandleImageUpload = () => {
    const [pendingImages, setPendingImages] = useState<Map<string, File>>(new Map());

    const handleImageUpload = async (file: File): Promise<string> => {
        // create data URL for preview
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                // Save the file with its data URL for later upload
                setPendingImages(prev => new Map(prev).set(dataUrl, file));
                resolve(dataUrl);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    return { pendingImages, setPendingImages, handleImageUpload };

}