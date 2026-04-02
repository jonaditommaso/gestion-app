'use client'
import Link from "next/link";
import { useTranslations } from "next-intl";
import Image from "next/image";
import CTAFooter from "./CTAFooter";


const LandingFooter = () => {
    const t = useTranslations('landing')

    return (
        <div className="flex flex-col px-28 w-full bg-[#171321]">

            <CTAFooter />


            <div className="flex items-start justify-around w-full  my-10">
                <div className="flex items-center gap-4">
                    <Image width={70} height={70} alt="gestionate logo footer" src={'/gestionate-logo-white.svg'} />
                    <p className="text-4xl text-white font-semibold m-5">Gestionate</p>
                </div>
                <div className="w-full flex justify-center gap-24 text-white">
                    <div className="flex flex-col gap-2">
                        <p className="font-semibold text-xl">{t('footer-solutions')}</p>
                        <Link href='/products#workspaces' className="hover:underline">{t('footer-workspace')}</Link>
                        <Link href='/products#billing' className="hover:underline">{t('footer-billing')}</Link>
                        <Link href='/products#sells' className="hover:underline">{t('footer-sells')}</Link>
                        <Link href='/products#chatbot' className="hover:underline">{t('footer-ai-chat')}</Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="font-semibold text-xl">{t('footer-resources')}</p>
                        <Link href='/getting-started' className="hover:underline">{t('footer-getting-started')}</Link>
                        <Link href='/docs' className="hover:underline">{t('footer-docs')}</Link>
                        <Link href='/faq' className="hover:underline">{t('footer-faq')}</Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="font-semibold text-xl">{t('footer-company')}</p>
                        <Link href='/about' className="hover:underline">{t('footer-about-us')}</Link>
                        <Link href='/contact' className="hover:underline">{t('footer-contact-us')}</Link>
                        <Link href='/terms' className="hover:underline">{t('footer-terms')}</Link>
                        <Link href='/privacy' className="hover:underline">{t('footer-privacy')}</Link>
                    </div>
                </div>
            </div>

            <hr className="h-1 w-full my-4 border-muted-foreground" />

            <p className="text-start my-5 text-xs mt-5 text-white">© 2025, Gestionate</p>
        </div>
    );
}

export default LandingFooter;