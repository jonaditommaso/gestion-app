/**
 * Error codes and types from Appwrite that we handle specially
 */
export const APPWRITE_ERROR_TYPES = {
    DOCUMENT_INVALID_STRUCTURE: 'document_invalid_structure',
} as const;

/**
 * Checks if an error message indicates a field length limit was exceeded
 */
export const isFieldTooLongError = (error: Error | string): boolean => {
    const message = typeof error === 'string' ? error : error.message;
    return message.includes('no longer than') ||
        message.includes('invalid type') ||
        message.includes('2048 chars');
};

/**
 * Gets a user-friendly error message based on the error type
 */
export const getErrorMessage = (
    error: Error,
    translations: {
        contentTooLong: string;
        defaultError: string;
    }
): string => {
    if (isFieldTooLongError(error)) {
        return translations.contentTooLong;
    }
    return translations.defaultError;
};
