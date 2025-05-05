import Link from "next/link";
import CustomWave from "./CustomWave";
import { getTranslations } from "next-intl/server";

const LandingFooter = async () => {
    const t = await getTranslations('landing')

    return (
        <>
            <CustomWave rotated rectColor="#9a3e6a" isBottom />

            <div className="w-full p-0 pb-2 bg-[#9a3e6a] mt-[-1px] text-white">
            <div className="flex flex-col items-start gap-1 ml-20 max-sm:ml-0 max-sm:items-center max-sm:text-sm">
                <Link href='/who-we-are'>{t('footer-who-we-are')}</Link>
                <Link href='/faq'>{t('footer-faq')}</Link>
                <Link href='/'>{t('footer-terms')}</Link>
                <Link href='/'>{t('footer-contact-us')}</Link>
            </div>
            <p className="text-center text-xs mt-5">© 2025, Gestionate</p>
            </div>
        </>
    );
}

export default LandingFooter;