import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface QuickPlansCardProps {
    planTitle: string,
    planDescription: string
}

const QuickPlansCard = async ({ planTitle, planDescription }: QuickPlansCardProps) => {
  const t = await getTranslations('landing')

    return (
        <Card className="w-[450px] max-sm:w-[300px]">
            <CardContent>
                <div className={cn("p-4 flex gap-2", planTitle === 'Empresa' && 'text-blue-600')}>
                    <CheckIcon fontSize={20} />
                    <p className="font-semibold">{t(planTitle)}</p>
                </div>
                <p className="text-sm text-muted-foreground">{t(planDescription)}</p>
            </CardContent>
        </Card>
    );
}

export default QuickPlansCard;