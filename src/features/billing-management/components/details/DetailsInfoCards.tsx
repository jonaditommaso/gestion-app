'use client'
import { useGetOperations } from "../../api/use-get-operations";
import InfoCard from "./InfoCard";
import dayjs from "dayjs";

const DetailsInfoCards = () => {
    const { data } = useGetOperations();

    const operations = data?.documents || [];

    const incomeTotal = operations.filter(({type}) => type === 'income').reduce((acc, operation) => acc + operation.import, 0) || 0
    const expenseTotal = operations.filter(({type}) => type === 'expense').reduce((acc, operation) => acc + operation.import, 0) || 0

    const projectionNet = (() => {
        const now = dayjs();

        const monthlyNets = Array.from({ length: 3 }).map((_, index) => {
            const monthDate = now.subtract(index, 'month');
            const monthStart = monthDate.startOf('month');
            const monthEnd = monthDate.endOf('month');

            const monthOps = operations.filter((operation) => {
                const opDate = dayjs(operation.date);
                return (opDate.isAfter(monthStart) || opDate.isSame(monthStart, 'day'))
                    && (opDate.isBefore(monthEnd) || opDate.isSame(monthEnd, 'day'));
            });

            const incomes = monthOps.filter(({ type }) => type === 'income').reduce((acc, operation) => acc + operation.import, 0);
            const expenses = monthOps.filter(({ type }) => type === 'expense').reduce((acc, operation) => acc + operation.import, 0);

            return incomes - expenses;
        });

        const avg = monthlyNets.reduce((acc, value) => acc + value, 0) / monthlyNets.length;
        return Number.isFinite(avg) ? avg : 0;
    })();

    return (
        <div className="flex justify-center">
            <InfoCard type='incomes' numberMoney={incomeTotal} />
            <InfoCard type='expenses' numberMoney={expenseTotal} />
            <InfoCard type='total' numberMoney={incomeTotal - expenseTotal} />
            <InfoCard type='projection' numberMoney={projectionNet} />
        </div>
    );
}

export default DetailsInfoCards;