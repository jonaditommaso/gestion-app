'use client'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FolderOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface NoDataProps {
    title: string,
    description: string
}

const NoData = ({ title, description }: NoDataProps) => {
    const t = useTranslations('info-messages');

    return (
        <>
            <Alert variant='default'>
                <FolderOpen className="h-4 w-4" />
                <AlertTitle>{t(title)}</AlertTitle>
                <AlertDescription>
                    {t(description)}
                </AlertDescription>
            </Alert>
            <div className="flex justify-center mt-20">
                <Image width={400} height={400} alt='empty image' src={'/empty.svg'} />
            </div>
        </>
    );
}

export default NoData;