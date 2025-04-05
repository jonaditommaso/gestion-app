'use client'
import { useGetOperations } from "../../api/use-get-operations";
import InfoCard from "./InfoCard";

const DetailsInfoCards = () => {
    const { data } = useGetOperations();

    const incomeTotal = data?.documents.filter(({type}) => type === 'income').reduce((acc, operation) => acc + operation.import, 0) || 0
    const expenseTotal = data?.documents.filter(({type}) => type === 'expense').reduce((acc, operation) => acc + operation.import, 0) || 0

    return (
        <div className="flex justify-center">
            <InfoCard type='incomes' numberMoney={incomeTotal} />
            <InfoCard type='expenses' numberMoney={expenseTotal} />
            <InfoCard type='total' numberMoney={incomeTotal - expenseTotal} />
        </div>
    );
}

export default DetailsInfoCards;