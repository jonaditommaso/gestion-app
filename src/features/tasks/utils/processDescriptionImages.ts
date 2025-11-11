import { UseMutateAsyncFunction } from "@tanstack/react-query";
import { UploadTaskImageRequest, UploadTaskImageResponse } from "../interfaces/upload-image";

type UploadHookType = UseMutateAsyncFunction<UploadTaskImageResponse, Error, UploadTaskImageRequest, unknown>

export const processDescriptionImages = async (
    html: string,
    pendingImages: Map<string, File>,
    uploadTaskImage: UploadHookType
): Promise<{ html: string, imageIds: string[] }> => {
    let processedHtml = html;
    const imageIds: string[] = [];

    // found all imgs with data URLs
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const images = doc.querySelectorAll('img[src^="data:"]');

    for (const img of Array.from(images)) {
        const dataUrl = img.getAttribute('src');
        if (!dataUrl) continue;

        // find the corresponding file in pendingImages
        const file = pendingImages.get(dataUrl);
        if (file) {
            try {
                // upload the image
                const result = await uploadTaskImage({ image: file });
                if (result.success && result.data) {
                    // replace the data URL with the real URL
                    processedHtml = processedHtml.replace(dataUrl, result.data.url);
                    // save the image ID
                    imageIds.push(result.data.fileId);
                }
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        }
    }

    return { html: processedHtml, imageIds };
}