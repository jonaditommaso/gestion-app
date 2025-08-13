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
        <Card className="group/card w-[350px] h-[250px] max-sm:h-[250px] flex flex-col items-center justify-center shadow-md hover:shadow-xl services-card my-10 cursor-pointer hover:scale-[1.02] transform transition-all duration-300 ease-in-out will-change-transform border-0 bg-white/80 backdrop-blur-sm relative overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center h-full pt-6 px-4 relative z-10">
                <div className="flex flex-col items-center gap-y-5">
                    <ColoredIcon
                        Icon={serviceIcon}
                        iconColor={serviceIconColor}
                        circleColor={serviceCircleColor}
                        circlePosition={circlePosition}
                    />
                    <h3 className="text-center font-semibold text-lg bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent leading-tight group-hover/card:from-slate-900 group-hover/card:via-slate-800 group-hover/card:to-slate-700 transition-all duration-300">
                        {t(serviceTitle)}
                    </h3>
                    <p className="text-center text-balance text-sm text-slate-600 leading-relaxed max-w-[280px] group-hover/card:text-slate-700 transition-colors duration-300">
                        {t(serviceDescription)}
                    </p>
                </div>
            </CardContent>

            {/* Gradiente de opacidad que aparece solo en hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-20"></div>

            {/* Botón que aparece en la parte inferior de la card en hover */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 translate-y-4 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-400 ease-out delay-100 z-30">
                <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 text-[#11314a] font-medium rounded-full bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-100/50">
                    <span className="text-sm">{t('see-more')}</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
            </div>
        </Card>
    );
}

export default ServicesCard;