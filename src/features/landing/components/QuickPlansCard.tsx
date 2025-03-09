import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

const QuickPlansCard = ({ planTitle }: { planTitle: string }) => {
    return (
        <Card className="w-[450px]">
            <CardContent>
                <div className={cn("p-4 flex gap-2", planTitle === 'Empresa' && 'text-blue-600')}>
                    <CheckIcon fontSize={20} />
                    <p className="font-semibold">{planTitle}</p>
                </div>
                <p className="text-sm text-muted-foreground">Contiene todas las funcionalidades disponibles. Ideal si quieres comenzar a organizar la facturacion, el registro de tus clientes, de tu inventario y las actividades de tu equipo en pequenas empresas</p>
            </CardContent>
        </Card>
    );
}

export default QuickPlansCard;