import { Card, CardContent } from "@/components/ui/card";
import { CheckIcon } from "lucide-react";

const QuickPlansCard = ({ planTitle }: { planTitle: string }) => {
    return (
        <Card className="w-[320px]">
            <CardContent className="p-4 flex gap-2">
                <CheckIcon fontSize={20} />
                {planTitle}
            </CardContent>
        </Card>
    );
}

export default QuickPlansCard;