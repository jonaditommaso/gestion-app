'use client'

import { useCurrent } from "@/features/auth/api/use-current";
import { useTranslations } from "next-intl";


const AccountType = () => {
    const { data: user } = useCurrent();
    const t = useTranslations('settings')

    return (
        <div className="text-center">
            <p className="text-xl">{t('account-type')}</p>
            <p>{user?.prefs.role === 'ADMIN' ? 'ADMIN' : 'CREATOR' }</p>
        </div>
    );
}

export default AccountType;