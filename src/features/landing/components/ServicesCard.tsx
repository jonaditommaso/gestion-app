import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import ColoredIcon from "./ColoredIcon";

interface ServicesCardProps {
    serviceTitle: string,
    serviceDescription: string,
    serviceIcon: LucideIcon,
    serviceIconColor: string,
    serviceCircleColor: string,
    circlePosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
}

const ServicesCard = ({
    serviceTitle,
    serviceDescription,
    serviceIconColor,
    serviceCircleColor,
    serviceIcon,
    circlePosition = "top-right"
}: ServicesCardProps) => {
    return (
        <Card className="max-w-[400px]  h-[350px] flex flex-col items-center justify-center shadow-md">
            <CardContent className="flex flex-col items-center gap-y-4">
                <ColoredIcon
                    Icon={serviceIcon}
                    iconColor={serviceIconColor}
                    circleColor={serviceCircleColor}
                    circlePosition={circlePosition}
                />
                <p className="text-center font-bold text-lg">{serviceTitle}</p>
                <p className="text-center text-balance text-sm max-w-[300px]">{serviceDescription}</p>
            </CardContent>
        </Card>
    );
}

export default ServicesCard;