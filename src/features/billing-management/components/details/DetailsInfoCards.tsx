'use client'
import { useGetOperations } from "../../api/use-get-operations";
import InfoCard from "./InfoCard";
import { Scale, TrendingDown, TrendingUp } from "lucide-react";

const DetailsInfoCards = () => {
    const { data } = useGetOperations();

    const incomeTotal = data?.documents.filter(({type}) => type === 'income').reduce((acc, operation) => acc + operation.import, 0) || 0
    const excomeTotal = data?.documents.filter(({type}) => type === 'excome').reduce((acc, operation) => acc + operation.import, 0) || 0

    return (
        <div className="flex justify-center">
            <InfoCard Icon={TrendingUp} colorIcon='#0bb314' numberMoney={incomeTotal} />
            <InfoCard Icon={TrendingDown} colorIcon='#f03410' numberMoney={excomeTotal} />
            <InfoCard Icon={Scale} colorIcon='#3f51b5' numberMoney={incomeTotal - excomeTotal} />
        </div>
    );
}

export default DetailsInfoCards;