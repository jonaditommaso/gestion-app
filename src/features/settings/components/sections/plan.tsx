import { Button } from "@/components/ui/button";
import { getCurrent } from "@/features/auth/queries";
import { createAdminClient } from "@/lib/appwrite";
import { getActiveContext } from "@/features/team/server/utils";
import capitalize from "@/utils/capitalize";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

const Plan = async () => {
    const user = await getCurrent();
    const t = await getTranslations('settings')

    if (!user) return null;

    const { databases } = await createAdminClient();
    const cookieStore = await cookies();
    const activeMembershipId = cookieStore.get('active-org-id')?.value;
    const context = await getActiveContext(user, databases, activeMembershipId);

    const plan = context?.org?.plan ?? '';
    const role = context?.membership?.role ?? 'VIEWER';

    return (
        <div className="flex items-center justify-between w-full">
            <h2>{capitalize(plan)}</h2>
            {(role === 'OWNER' || role === 'ADMIN') && <Button variant='outline'>{t('see-plans')}</Button>}
        </div>
    );
}

export default Plan;