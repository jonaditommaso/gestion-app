import { z } from 'zod';

export const upsertSsoConfigSchema = z.object({
    domain: z
        .string()
        .min(1, 'Domain is required')
        .max(50, 'Domain cannot exceed 50 characters')
        .regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid domain format (e.g. acme.com)'),
    enabled: z.boolean(),
    provider: z.enum(['GOOGLE_WORKSPACE', 'OIDC', 'SAML']),
});
