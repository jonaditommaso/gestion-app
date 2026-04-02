import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';
import { SSOConfig } from '../types';

export const useGetSsoConfig = () => {
    return useQuery({
        queryKey: ['sso', 'config'],
        queryFn: async () => {
            const response = await client.api.sso.$get();

            if (!response.ok) {
                throw new Error('Failed to fetch SSO config');
            }

            const { data } = await response.json();

            return data as SSOConfig | null;
        },
    });
};
