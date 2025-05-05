import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

interface AuthLayoutProps {
    children: React.ReactNode
}

const AuthLayout = async ({ children }: AuthLayoutProps) => {
    const t = await getTranslations('auth');

    return (
        <main className="bg-neutral-100 min-h-screen">
            <div className="p-10 max-sm:p-2">
                <Link href='/' className="inline-flex items-center hover:underline max-sm:text-sm">
                    <ArrowLeft className="mr-2"/> {t('back-home')}
                </Link>
            </div>
            <div className="mx-auto max-w-screen-2xl p-4">
                <div className="flex flex-col items-center justify-center pt-4 md:pt-10 max-sm:pt-0">
                    {children}
                </div>
            </div>
        </main>
    );
}

export default AuthLayout;