import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import ColoredIcon from "./ColoredIcon";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
// import Link from "next/link";

interface ServicesCardProps {
    serviceTitle: string,
    serviceDescription: string,
    serviceIcon: LucideIcon,
    serviceIconColor: string,
    serviceCircleColor: string,
    circlePosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right",
    shadowColor: string
}

const ServicesCard = async ({
    serviceTitle,
    serviceDescription,
    serviceIconColor,
    serviceCircleColor,
    serviceIcon,
    circlePosition = "top-right",
    shadowColor
}: ServicesCardProps) => {
    const t = await getTranslations('landing')

    return (
        <Card className={cn('group/card w-[350px] h-[250px] max-sm:h-[250px] flex flex-col items-center justify-center rounded-[28px] border border-white/10 bg-white/8 shadow-[0_18px_45px_-25px_rgba(8,15,30,0.85)] hover:shadow-[0_24px_45px_-18px] services-card my-10 cursor-pointer hover:-translate-y-1 hover:scale-[1.02] transform transition-all duration-300 ease-in-out will-change-transform bg-[linear-gradient(135deg,rgba(255,255,255,0.10),rgba(148,163,184,0.05))] relative overflow-hidden', shadowColor)}>
            <CardContent className="flex flex-col items-center justify-start h-full pt-6 px-4 relative z-10">
                <div className="flex flex-col items-center gap-y-5">
                    <div className="flex items-center justify-center">
                        <ColoredIcon
                            Icon={serviceIcon}
                            iconColor={serviceIconColor}
                            circleColor={serviceCircleColor}
                            circlePosition={circlePosition}
                        />
                    </div>
                    <div className="flex items-center justify-center">
                        <h3 className="text-center font-semibold text-lg bg-gradient-to-br from-white via-slate-100 to-cyan-100 bg-clip-text text-transparent leading-tight group-hover/card:from-white group-hover/card:via-cyan-50 group-hover/card:to-sky-100 transition-all duration-300">
                            {t(serviceTitle)}
                        </h3>
                    </div>
                    <div className="flex items-center justify-center">
                        <p className="text-center text-balance text-sm text-slate-200 leading-relaxed max-w-[280px] group-hover/card:text-slate-100 transition-colors duration-300">
                            {t(serviceDescription)}
                        </p>
                    </div>
                </div>
            </CardContent>

            {/* //? "see more" commented until the screens are ready */}
            {/* Gradiente de opacidad que aparece solo en hover */}
            {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-20"></div> */}

            {/* Botón que aparece en la parte inferior de la card en hover */}
            {/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 translate-y-4 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-400 ease-out delay-100 z-30">
                <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 text-[#11314a] font-medium rounded-full bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-100/50">
                    <span className="text-sm">{t('see-more')}</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
            </div> */}
        </Card>
    );
}

export default ServicesCard;