import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface QuickPlansCardProps {
    planTitle: string,
    planDescription: string
}

const QuickPlansCard = ({ planTitle, planDescription }: QuickPlansCardProps) => {
    return (
        <Card className="w-[450px]">
            <CardContent>
                <div className={cn("p-4 flex gap-2", planTitle === 'Empresa' && 'text-blue-600')}>
                    <CheckIcon fontSize={20} />
                    <p className="font-semibold">{planTitle}</p>
                </div>
                <p className="text-sm text-muted-foreground">{planDescription}</p>
            </CardContent>
        </Card>
    );
}

export default QuickPlansCard;