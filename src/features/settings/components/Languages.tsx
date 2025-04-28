'use client'
import { LanguagesSelection } from "@/components/LanguagesSelection";
import { useTranslations } from "next-intl";

const Languages = () => {
    const t = useTranslations('settings');

    return (
        <div>
            <p className="text-xl">{t('language')}</p>
            <LanguagesSelection />
        </div>
    );
}

export default Languages;