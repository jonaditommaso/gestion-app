import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CircleIcon } from "./CircleIcon";
import { Scale, TrendingDown, TrendingUp } from "lucide-react";
import { useDataBillingTable } from "../../hooks/useDataBillingTable";
import { billingServiceObserver } from "@/utils/billingServiceObserver";
import { useEffect, useState } from "react";

interface InfoCardProps {
    numberMoney: number,
    type: 'incomes' | 'expenses' | 'total'
}

const types = {
    incomes: {
        icon: TrendingUp,
        color: '#0bb314',
        id: 'income',
        message: 'Ver solo ingresos'
    },
    expenses: {
        icon: TrendingDown,
        color: '#f03410',
        id: 'expense',
        message: 'Ver solo gastos'
    },
    total: {
        icon: Scale,
        color: '#3f51b5',
        id: 'total',
        message: 'Ver total'
    }
}

const InfoCard = ({ numberMoney, type }: InfoCardProps) => {
    const { selectedData } = useDataBillingTable();

    const [dataType, setDataType] = useState(selectedData);

    useEffect(() => {
    setDataType(selectedData);
    }, [selectedData])

    const handleChangeDataView = () => {
        billingServiceObserver.sendData(types[type].id)
    }

    return (
        <Card className="min-w-48 m-2">
            <CardContent className="flex flex-col items-center mt-4">
                <div className="mb-3">
                    <CircleIcon Icon={types[type].icon} color={types[type].color} />
                </div>
                <p className="text-3xl ">
                    <span className="text-xl">€</span> {numberMoney} {/* <span className="text-xs">+3%</span>*/}
                </p>
            </CardContent>
            <CardFooter className="justify-center">
                <Button variant='link' size='sm' className={dataType === types[type].id ? 'text-blue-600' : ''} onClick={handleChangeDataView}>
                    {types[type].message}
                </Button>
            </CardFooter>
        </Card>
    );
}

export default InfoCard;