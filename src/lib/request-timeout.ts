/**
 * Default timeout for mutation requests (POST, PUT, PATCH, DELETE).
 * After this time, the request will be aborted and an error will be thrown.
 */
export const MUTATION_TIMEOUT_MS = 15000; // 15 seconds

/**
 * Creates a promise that rejects after a specified timeout.
 * Used to race against fetch requests to implement request timeouts.
 */
export const createTimeoutPromise = (ms: number): Promise<never> => {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error('Request timeout - please check your connection'));
        }, ms);
    });
};

/**
 * Wraps a promise with a timeout. If the promise doesn't resolve
 * within the specified time, it will reject with a timeout error.
 *
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds (default: MUTATION_TIMEOUT_MS)
 * @returns The result of the promise if it resolves in time
 * @throws Error if the promise times out
 */
export const withTimeout = <T>(
    promise: Promise<T>,
    timeoutMs: number = MUTATION_TIMEOUT_MS
): Promise<T> => {
    return Promise.race([promise, createTimeoutPromise(timeoutMs)]);
};
