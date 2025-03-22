'use client'
import { useGetOperations } from "../../api/use-get-operations";
import InfoCard from "./InfoCard";
import { Scale, TrendingDown, TrendingUp } from "lucide-react";

const DetailsInfoCards = () => {
    const { data } = useGetOperations();

    const incomeTotal = data?.documents.filter(({type}) => type === 'income').reduce((acc, operation) => acc + operation.import, 0) || 0
    const expenseTotal = data?.documents.filter(({type}) => type === 'expense').reduce((acc, operation) => acc + operation.import, 0) || 0

    return (
        <div className="flex justify-center">
            <InfoCard Icon={TrendingUp} colorIcon='#0bb314' numberMoney={incomeTotal} />
            <InfoCard Icon={TrendingDown} colorIcon='#f03410' numberMoney={expenseTotal} />
            <InfoCard Icon={Scale} colorIcon='#3f51b5' numberMoney={incomeTotal - expenseTotal} />
        </div>
    );
}

export default DetailsInfoCards;