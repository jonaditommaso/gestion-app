import { TaskMetadata } from "../types";

/**
 * Deserializa el string de metadata a un objeto TaskMetadata
 */
export const parseTaskMetadata = (metadataString?: string): TaskMetadata => {
    if (!metadataString) return {};

    try {
        return JSON.parse(metadataString) as TaskMetadata;
    } catch (error) {
        console.error('Error parsing task metadata:', error);
        return {};
    }
};

/**
 * Serializa un objeto TaskMetadata a string JSON
 */
export const stringifyTaskMetadata = (metadata: TaskMetadata): string => {
    return JSON.stringify(metadata);
};

/**
 * Obtiene los imageIds de la metadata
 */
export const getImageIds = (task: { metadata?: string }): string[] => {
    const metadata = parseTaskMetadata(task.metadata);
    return metadata.imageIds || [];
};

/**
 * Actualiza los imageIds en la metadata
 */
export const updateImageIds = (currentMetadata: string | undefined, imageIds: string[]): string => {
    const metadata = parseTaskMetadata(currentMetadata);
    return stringifyTaskMetadata({
        ...metadata,
        imageIds: imageIds.length > 0 ? imageIds : undefined
    });
};
