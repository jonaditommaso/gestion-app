import { Card, CardContent } from "@/components/ui/card";
import { SettingsIcon } from "lucide-react";

interface ServicesCardProps {
    serviceTitle: string,
    serviceDescription: string
}

const ServicesCard = ({ serviceTitle, serviceDescription }: ServicesCardProps) => {
    return (
        <Card className="max-w-[400px]  h-[350px] flex flex-col items-center justify-center shadow-md">
            <CardContent className="flex flex-col items-center gap-y-4">
                <SettingsIcon size='50' />
                <p className="text-center font-bold text-lg">{serviceTitle}</p>
                <p className="text-center text-balance text-sm max-w-[300px]">{serviceDescription}</p>
            </CardContent>
        </Card>
    );
}

export default ServicesCard;