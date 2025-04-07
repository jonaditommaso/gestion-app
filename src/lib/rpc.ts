import { AppType } from '@/app/api/[[...route]]/route';
import { hc } from 'hono/client';
import { fetchWithCredentials } from './fetchWithCredentials';

export const client = hc<AppType>(process.env.NEXT_PUBLIC_APP_URL!, {
    fetch: fetchWithCredentials,
})