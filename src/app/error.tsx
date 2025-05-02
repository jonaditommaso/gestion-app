'use client'
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

const ErrorPage = () => {
    const t = useTranslations('general');

    return (
        <div className="h-screen flex flex-col gap-y-4 items-center justify-center">
            <AlertTriangle className="size-6"/>
            <p className="text-sm">
                {t('something-went-wrong')}
            </p>
            <Button variant='secondary' size='sm'>
                <Link href='/'>{t('back-to-home')}</Link>
            </Button>
        </div>
    );
}

export default ErrorPage;