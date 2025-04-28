import { useLocale } from "next-intl";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

const languages = [
    {
        key: 'es',
        img: 'ES',
        alt: 'Spanish flag',
        label: 'Español'
    },
    {
        key: 'it',
        img: 'IT',
        alt: 'Italian flag',
        label: 'Italiano'
    },
    {
        key: 'en',
        img: 'US',
        alt: 'United States flag',
        w: 22,
        cclass: 'transform scale-125',
        label: 'English'
    },
]

export const LanguagesSelection = ({className = '', label = false})=> {
    const currentLocale = useLocale();

    const changeLanguage = (locale: string) => {
        if (locale === currentLocale) return;

        document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
        window.location.reload();
    };

    const Wrapper = label ? DropdownMenuItem : 'div'

    return (
        <div className={cn("flex gap-2 mt-4 ", className)}>
            {languages.map(language => {
                const content = (
                    <>
                        <Image
                            src={`/flags/${language.img}-flag.svg`}
                            alt={language.alt}
                            width={language.w ? language.w : 24}
                            height={16}
                            className={cn("cursor-pointer", language.cclass, currentLocale !== language.key ? 'grayscale' : '')}
                        />
                        {label && language.label}
                    </>
                );

                return (
                <Wrapper key={language.key} className={cn("cursor-pointer flex items-center", label && "gap-4")} onClick={() => changeLanguage(language.key)}>
                    {content}
                </Wrapper>
            )})}
        </div>
    )
}