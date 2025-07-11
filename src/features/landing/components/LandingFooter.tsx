import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import DemoButton from "./DemoButton";
import { Button } from "@/components/ui/button";

const LandingFooter = async () => {
    const t = await getTranslations('landing')

    return (//#0d1117 descubre que tan lejos puedes llegar. Ya sea que estés escalando tu propio proyecto como si quieres aumentar la productividad de tu empresa y olvidarte de múltiples plataformas de sincronización laboral, tenemos la solución ideal para ti.
        <div className="flex flex-col px-28 w-full bg-[#171321]">

            <div className="text-white flex flex-col items-center my-20 m-auto w-full gap-4">
                <p className="font-semibold text-3xl tracking-tight">Start working comfortably and productively</p>
                <p className="text-muted-foreground w-[800px] text-center text-balance">{"Discover how far you can go. Whether you're scaling your own project or want to increase your company's productivity and forget about multiple work-syncing platforms, we have the ideal solution for you."}</p>
                <div className="flex gap-4">
                    <Link href={'/pricing'}>
                        <Button variant='secondary' size='lg'>{t('get-started')}</Button>
                    </Link>
                    <DemoButton text={t('button-get-demo-2')} fit />
                </div>
            </div>

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
                        <Link href='/' className="hover:underline">Quick start guides</Link>
                        <Link href='/' className="hover:underline">Product Documentation</Link>
                        <Link href='/' className="hover:underline">Learn more</Link>
                        <Link href='/faq' className="hover:underline">{t('footer-faq')}</Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="font-semibold text-xl">Company</p>
                        <Link href='/' className="hover:underline">About us</Link>
                        <Link href='/' className="hover:underline">Leadership</Link>
                        <Link href='/' className="hover:underline">Blog</Link>
                        <Link href='/' className="hover:underline">{t('footer-contact-us')}</Link>
                        <Link href='/' className="hover:underline">{t('footer-terms')}</Link>
                    </div>
                </div>
            </div>

            <hr className="h-1 w-full my-4 border-muted-foreground" />

            <p className="text-start my-5 text-xs mt-5 text-white">© 2025, Gestionate</p>
        </div>
    );
}

export default LandingFooter;