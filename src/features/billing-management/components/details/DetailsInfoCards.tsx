'use client'
import { useGetOperations } from "../../api/use-get-operations";
import InfoCard from "./InfoCard";
import dayjs from "dayjs";

interface DashboardOperation {
    type: 'income' | 'expense';
    import: number;
    date: string | Date;
}

const DetailsInfoCards = () => {
    const { data } = useGetOperations();

    const operations = (data?.documents || []) as unknown as DashboardOperation[];

    const getMonthSummary = (monthOffset: number) => {
        const monthDate = dayjs().subtract(monthOffset, 'month');
        const monthStart = monthDate.startOf('month');
        const monthEnd = monthDate.endOf('month');

        const monthOperations = operations.filter((operation) => {
            const operationDate = dayjs(operation.date);
            return (operationDate.isAfter(monthStart) || operationDate.isSame(monthStart, 'day'))
                && (operationDate.isBefore(monthEnd) || operationDate.isSame(monthEnd, 'day'));
        });

        const incomes = monthOperations
            .filter((operation) => operation.type === 'income')
            .reduce((acc, operation) => acc + operation.import, 0);

        const expenses = monthOperations
            .filter((operation) => operation.type === 'expense')
            .reduce((acc, operation) => acc + operation.import, 0);

        return {
            incomes,
            expenses,
            net: incomes - expenses,
        };
    };

    const calculatePercentChange = (currentValue: number, previousValue: number) => {
        if (previousValue === 0) {
            if (currentValue === 0) return 0;
            return currentValue > 0 ? 100 : -100;
        }

        const percent = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
        return Number.isFinite(percent) ? percent : 0;
    };

    const currentMonth = getMonthSummary(0);
    const previousMonth = getMonthSummary(1);

    const currentProjectionWindow = [0, 1, 2].map((offset) => getMonthSummary(offset).net);
    const previousProjectionWindow = [1, 2, 3].map((offset) => getMonthSummary(offset).net);

    const currentProjection = currentProjectionWindow.reduce((acc, value) => acc + value, 0) / currentProjectionWindow.length;
    const previousProjection = previousProjectionWindow.reduce((acc, value) => acc + value, 0) / previousProjectionWindow.length;

    const projectionNet = Number.isFinite(currentProjection) ? currentProjection : 0;

    const incomesComparison = calculatePercentChange(currentMonth.incomes, previousMonth.incomes);
    const expensesComparison = calculatePercentChange(currentMonth.expenses, previousMonth.expenses);
    const totalComparison = calculatePercentChange(currentMonth.net, previousMonth.net);
    const projectionComparison = calculatePercentChange(projectionNet, previousProjection);

    return (
        <div className="w-full grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoCard type='incomes' numberMoney={currentMonth.incomes} comparisonPercent={incomesComparison} />
            <InfoCard type='expenses' numberMoney={currentMonth.expenses} comparisonPercent={expensesComparison} />
            <InfoCard type='total' numberMoney={currentMonth.net} comparisonPercent={totalComparison} />
            <InfoCard type='projection' numberMoney={projectionNet} comparisonPercent={projectionComparison} />
        </div>
    );
}

export default DetailsInfoCards;