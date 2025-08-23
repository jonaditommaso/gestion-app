import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import CTAFooter from "./CTAFooter";


const LandingFooter = async () => {
    const t = await getTranslations('landing')

    return (
        <div className="flex flex-col px-28 w-full bg-[#171321]">

            <CTAFooter />

            <hr className="h-1 w-full my-4 border-muted-foreground" />

            <div className="flex items-start justify-around w-full  my-10">
                <div className="flex items-center gap-4">
                    <Image width={70} height={70} alt="gestionate logo footer" src={'/gestionate-logo-white.svg'} />
                    <p className="text-4xl text-white font-semibold m-5">Gestionate</p>
                </div>
                <div className="w-full flex justify-center gap-24 text-white">
                    <div className="flex flex-col gap-2">
                        <p className="font-semibold text-xl">Solutions</p>
                        <Link href='/' className="hover:underline">Workspace</Link>
                        <Link href='/' className="hover:underline">Billing</Link>
                        <Link href='/' className="hover:underline">Inventory</Link>
                        <Link href='/' className="hover:underline">Records</Link>
                        <Link href='/' className="hover:underline">Internal chat</Link>
                        <Link href='/' className="hover:underline">Permissions</Link>
                        <Link href='/' className="hover:underline">All-in-one</Link>
                        <Link href='/' className="hover:underline">Team</Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="font-semibold text-xl">Resources</p>
                        <Link href='/quick-start' className="hover:underline">Quick start guides</Link>
                        <Link href='/product-docs' className="hover:underline">Product Documentation</Link>
                        <Link href='/docs' className="hover:underline">Learn more</Link>
                        <Link href='/faq' className="hover:underline">{t('footer-faq')}</Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="font-semibold text-xl">Company</p>
                        <Link href='/about' className="hover:underline">About us</Link>
                        <Link href='/' className="hover:underline">Leadership</Link>
                        <Link href='/blog' className="hover:underline">Blog</Link>
                        <Link href='/contact' className="hover:underline">{t('footer-contact-us')}</Link>
                        <Link href='/terms' className="hover:underline">{t('footer-terms')}</Link>
                        <Link href='/privacy' className="hover:underline">{'footer-privacy'}</Link>
                    </div>
                </div>
            </div>

            <hr className="h-1 w-full my-4 border-muted-foreground" />

            <p className="text-start my-5 text-xs mt-5 text-white">© 2025, Gestionate</p>
        </div>
    );
}

export default LandingFooter;