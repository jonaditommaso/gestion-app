import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import ColoredIcon from "./ColoredIcon";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

interface ServicesCardProps {
    serviceTitle: string,
    serviceDescription: string,
    serviceIcon: LucideIcon,
    serviceIconColor: string,
    serviceCircleColor: string,
    circlePosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
}

const ServicesCard = async ({
    serviceTitle,
    serviceDescription,
    serviceIconColor,
    serviceCircleColor,
    serviceIcon,
    circlePosition = "top-right"
}: ServicesCardProps) => {
    const t = await getTranslations('landing')

    return (
        <Card className="group/card max-w-[300px] h-[280px] max-sm:h-[250px] flex flex-col items-center justify-center shadow-md services-card my-10 cursor-pointer hover:scale-[1.02] transform transition-transform duration-200 ease-in-out will-change-transform">
            <CardContent className="flex flex-col items-center justify-between h-full pt-6 px-2">
                <div className="flex flex-col items-center gap-y-4">
                    <ColoredIcon
                        Icon={serviceIcon}
                        iconColor={serviceIconColor}
                        circleColor={serviceCircleColor}
                        circlePosition={circlePosition}
                    />
                    <p className="text-center font-bold text-lg">{t(serviceTitle)}</p>
                    <p className="text-center text-balance text-sm max-w-[300px]">{t(serviceDescription)}</p>
                </div>

            <div className="opacity-0 translate-y-4 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-500 ease-out delay-75">
                <Link href="/" className="inline-flex items-center gap-1 text-[#11314a] font-medium relative overflow-hidden before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[0.5px] before:bg-[#11314a] before:transition-all before:duration-300 group-hover/card:before:w-full w-fit">
                    {t('see-more')} →
                </Link>
            </div>
            </CardContent>
        </Card>
    );
}

export default ServicesCard;