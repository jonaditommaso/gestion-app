'use client'
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

const Languages = () => {
    const currentLocale = useLocale();
    const t = useTranslations('settings');

    const changeLanguage = (locale: string) => {
        if (locale === currentLocale) return;

        document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
        window.location.reload();
    };

    return (
        <div>
            <p className="text-xl">{t('language')}</p>
            <div className="flex gap-4 mt-4">
                <Image src="/flags/ES-flag.svg" alt="Spanish flag" width={24} height={16} className={cn("cursor-pointer", currentLocale !== 'es' ? 'grayscale' : '')} onClick={() => changeLanguage('es')} />
                <Image src="/flags/US-flag.svg" alt="United States flag" width={22} height={16} className={cn("transform scale-125 cursor-pointer", currentLocale !== 'en' ? 'grayscale' : '')} onClick={() => changeLanguage('en')} />
                <Image src="/flags/IT-flag.svg" alt="Italian flag" width={24} height={16} className={cn("cursor-pointer", currentLocale !== 'it' ? 'grayscale' : '')} onClick={() => changeLanguage('it')} />
            </div>
        </div>
    );
}

export default Languages;