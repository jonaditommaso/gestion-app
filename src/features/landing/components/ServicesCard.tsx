import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import ColoredIcon from "./ColoredIcon";
import { getTranslations } from "next-intl/server";

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
        <Card className="max-w-[400px]  h-[350px] max-sm:h-[250px] flex flex-col items-center justify-center shadow-md services-card">
            <CardContent className="flex flex-col items-center gap-y-4">
                <ColoredIcon
                    Icon={serviceIcon}
                    iconColor={serviceIconColor}
                    circleColor={serviceCircleColor}
                    circlePosition={circlePosition}
                />
                <p className="text-center font-bold text-lg">{t(serviceTitle)}</p>
                <p className="text-center text-balance text-sm max-w-[300px]">{t(serviceDescription)}</p>
            </CardContent>
        </Card>
    );
}

export default ServicesCard;