import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { sessionMiddleware } from '@/lib/session-middleware';
import { createAdminClient } from '@/lib/appwrite';
import { ID, Query } from 'node-appwrite';
import { DATABASE_ID, SSO_CONFIGS_ID } from '@/config';
import { upsertSsoConfigSchema } from '../schemas';
import { SSOConfig } from '../types';
import { getActiveContext } from '@/features/team/server/utils';
import { cookies } from 'next/headers';

const app = new Hono()

    .get(
        '/',
        sessionMiddleware,
        async (ctx) => {
            const user = ctx.get('user');
            const { databases } = await createAdminClient();

            const cookieStore = await cookies();
            const activeMembershipId = cookieStore.get('active-org-id')?.value;
            const context = await getActiveContext(user, databases, activeMembershipId);

            if (!context) {
                return ctx.json({ data: null });
            }

            const result = await databases.listDocuments<SSOConfig>(
                DATABASE_ID,
                SSO_CONFIGS_ID,
                [Query.equal('organizationId', context.org.$id), Query.limit(1)]
            );

            return ctx.json({ data: result.documents[0] ?? null });
        }
    )

    .post(
        '/',
        sessionMiddleware,
        zValidator('json', upsertSsoConfigSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const { databases } = await createAdminClient();
            const { domain, enabled, provider } = ctx.req.valid('json');

            const cookieStore = await cookies();
            const activeMembershipId = cookieStore.get('active-org-id')?.value;
            const context = await getActiveContext(user, databases, activeMembershipId);

            if (!context) {
                return ctx.json({ error: 'Not found' }, 404);
            }

            if (context.org.plan !== 'ENTERPRISE') {
                return ctx.json({ error: 'Forbidden' }, 403);
            }

            if (context.membership.role !== 'OWNER' && context.membership.role !== 'ADMIN') {
                return ctx.json({ error: 'Forbidden' }, 403);
            }

            const existing = await databases.listDocuments<SSOConfig>(
                DATABASE_ID,
                SSO_CONFIGS_ID,
                [Query.equal('organizationId', context.org.$id), Query.limit(1)]
            );

            const payload = {
                organizationId: context.org.$id,
                enabled,
                provider,
                domain: domain.toLowerCase().trim(),
            };

            let doc: SSOConfig;

            if (existing.documents.length > 0) {
                doc = await databases.updateDocument<SSOConfig>(
                    DATABASE_ID,
                    SSO_CONFIGS_ID,
                    existing.documents[0].$id,
                    payload
                );
            } else {
                doc = await databases.createDocument<SSOConfig>(
                    DATABASE_ID,
                    SSO_CONFIGS_ID,
                    ID.unique(),
                    payload
                );
            }

            return ctx.json({ data: doc });
        }
    );

export default app;
