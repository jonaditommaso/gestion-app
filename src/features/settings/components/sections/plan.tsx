import { Button } from "@/components/ui/button";
import { getCurrent } from "@/features/auth/queries";
import capitalize from "@/utils/capitalize";
import { getTranslations } from "next-intl/server";

const Plan = async () => {
    const user = await getCurrent();
    const t = await getTranslations('settings')

    return (
        <div className="flex items-center justify-between w-full">
            <h2>{capitalize(user?.prefs?.plan)}</h2>
            {user?.prefs.role === 'ADMIN' && <Button variant='outline'>{t('see-plans')}</Button>}
        </div>
    );
}

export default Plan;