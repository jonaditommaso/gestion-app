import { getCurrent } from '@/features/auth/queries';
import { createAdminClient } from '@/lib/appwrite';
import { getActiveContext } from '@/features/team/server/utils';
import { DATABASE_ID, SSO_CONFIGS_ID } from '@/config';
import { Query } from 'node-appwrite';
import { SSOConfig } from '../types';
import SSOConfigForm from './SSOConfigForm';
import { Separator } from '@/components/ui/separator';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';

const SSOSettings = async () => {
    const user = await getCurrent();

    if (!user) return null;

    const { databases } = await createAdminClient();
    const cookieStore = await cookies();
    const activeMembershipId = cookieStore.get('active-org-id')?.value;
    const context = await getActiveContext(user, databases, activeMembershipId);

    if (!context) return null;
    if (context.org.plan !== 'ENTERPRISE') return null;
    if (context.membership.role !== 'OWNER' && context.membership.role !== 'ADMIN') return null;

    const result = await databases.listDocuments<SSOConfig>(
        DATABASE_ID,
        SSO_CONFIGS_ID,
        [Query.equal('organizationId', context.org.$id), Query.limit(1)]
    );

    const config = result.documents[0] ?? null;

    const t = await getTranslations('sso');

    return (
        <div className="min-w-[500px] mb-16">
            <p className="text-xl">{t('section-title')}</p>
            <Separator className="mt-1 mb-4" />
            <SSOConfigForm config={config} />
        </div>
    );
};

export default SSOSettings;
