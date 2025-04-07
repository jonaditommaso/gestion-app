import { ExecutionContext } from 'hono';

export const fetchWithCredentials = (
  input: RequestInfo | URL,
  init?: RequestInit,
  env?: any,
  executionCtx?: ExecutionContext
): Promise<Response> => {
  return fetch(input, {
    ...init,
    credentials: 'include',
  });
};