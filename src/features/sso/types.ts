import { Models } from 'node-appwrite';

export type SSOProvider = 'GOOGLE_WORKSPACE' | 'OIDC' | 'SAML';

export interface SSOConfig extends Models.Document {
    organizationId: string;
    enabled: boolean;
    provider: SSOProvider;
    domain: string;
}
