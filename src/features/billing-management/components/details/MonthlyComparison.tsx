'use client'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { useGetOperations } from "../../api/use-get-operations";
import { useMemo } from "react";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";

interface BillingOperation {
    type: 'income' | 'expense';
    date: string | Date;
    import: number;
}

const MonthlyComparison = () => {
    const { data } = useGetOperations();
    const t = useTranslations('billing');

    const operations = useMemo(() => (data?.documents || []) as unknown as BillingOperation[], [data]);

    const currentMonthStart = dayjs().startOf('month');
    const currentMonthEnd = dayjs().endOf('month');
    const previousMonthStart = dayjs().subtract(1, 'month').startOf('month');
    const previousMonthEnd = dayjs().subtract(1, 'month').endOf('month');

    const aggregateMonth = (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => {
        const monthOperations = operations.filter((operation) => {
            const operationDate = dayjs(operation.date);
            return (operationDate.isAfter(startDate) || operationDate.isSame(startDate, 'day'))
                && (operationDate.isBefore(endDate) || operationDate.isSame(endDate, 'day'))
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
        }
    }

    const current = aggregateMonth(currentMonthStart, currentMonthEnd);
    const previous = aggregateMonth(previousMonthStart, previousMonthEnd);

    const netDifference = current.net - previous.net;
    const netVariation = previous.net === 0
        ? 100
        : ((netDifference / Math.abs(previous.net)) * 100);

    return (
        <Accordion type="single" collapsible defaultValue="monthly-comparison" className="w-full max-w-[832px] mt-4">
            <AccordionItem value="monthly-comparison" className="border rounded-lg px-4">
                <AccordionTrigger className="py-4 hover:no-underline">
                    <span className="text-sm font-medium">{t('month-comparison-title')}</span>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pb-2">
                        <div className="border rounded-md p-3">
                            <p className="text-muted-foreground">{t('current-month')}</p>
                            <p>{t('total-incomes')}: € {current.incomes.toFixed(2)}</p>
                            <p>{t('total-expenses')}: € {current.expenses.toFixed(2)}</p>
                            <p className="font-semibold">{t('net-flow')}: € {current.net.toFixed(2)}</p>
                        </div>

                        <div className="border rounded-md p-3">
                            <p className="text-muted-foreground">{t('previous-month')}</p>
                            <p>{t('total-incomes')}: € {previous.incomes.toFixed(2)}</p>
                            <p>{t('total-expenses')}: € {previous.expenses.toFixed(2)}</p>
                            <p className="font-semibold">{t('net-flow')}: € {previous.net.toFixed(2)}</p>
                        </div>

                        <div className="border rounded-md p-3">
                            <p className="text-muted-foreground">{t('net-variation')}</p>
                            <p className={netDifference >= 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                                {netDifference >= 0 ? '+' : ''}€ {netDifference.toFixed(2)}
                            </p>
                            <p className={netVariation >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                ({netVariation >= 0 ? '+' : ''}{netVariation.toFixed(1)}%)
                            </p>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

export default MonthlyComparison;
