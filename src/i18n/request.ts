import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export default getRequestConfig(async () => {

    const defaultLocale = (await headers()).get("accept-language")?.split(",")[0];
    const localeFromCookie = (await cookies()).get("NEXT_LOCALE")?.value || defaultLocale || "en"; // create a cookie with user language configuration

    const locale = localeFromCookie
        ? localeFromCookie.split("-")[0]
        : (defaultLocale?.split("-")[0] || "en");

    const supportedLocales = ['en', 'es', 'it'];
    const finalLocale = supportedLocales.includes(locale) ? locale : 'en';

    return {
        locale: finalLocale,
        messages: (await import(`../../translations/${finalLocale}.json`)).default
    };
});