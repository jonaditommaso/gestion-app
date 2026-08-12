'use client'

import { useGetOperations } from "../../api/use-get-operations";
import { useCallback, useMemo } from "react";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

    const aggregateMonth = useCallback((startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => {
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
    }, [operations]);

    const current = aggregateMonth(currentMonthStart, currentMonthEnd);
    const previous = aggregateMonth(previousMonthStart, previousMonthEnd);

    const netDifference = current.net - previous.net;
    const netVariation = previous.net === 0
        ? 100
        : ((netDifference / Math.abs(previous.net)) * 100);

    const trendData = useMemo(() => {
        return Array.from({ length: 6 }).map((_, index) => {
            const monthDate = dayjs().subtract(5 - index, 'month');
            const monthStart = monthDate.startOf('month');
            const monthEnd = monthDate.endOf('month');
            const monthValues = aggregateMonth(monthStart, monthEnd);

            return {
                month: monthDate.format('MMM'),
                net: Number(monthValues.net.toFixed(2)),
            };
        });
    }, [aggregateMonth]);

    return (
        <Card className="w-full border-border/80 bg-card shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">{t('month-comparison-title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                    <div className="rounded-xl border bg-muted/20 p-3 m-auto h-full min-w-[180px] w-full text-center">
                        <p className="text-muted-foreground">{t('current-month')}</p>
                        <p>{t('total-incomes')}: € {current.incomes.toFixed(2)}</p>
                        <p>{t('total-expenses')}: € {current.expenses.toFixed(2)}</p>
                        <p className="font-semibold">{t('net-flow')}: € {current.net.toFixed(2)}</p>
                    </div>

                    <div className="rounded-xl border bg-muted/20 p-3 m-auto h-full min-w-[180px] w-full text-center">
                        <p className="text-muted-foreground">{t('previous-month')}</p>
                        <p>{t('total-incomes')}: € {previous.incomes.toFixed(2)}</p>
                        <p>{t('total-expenses')}: € {previous.expenses.toFixed(2)}</p>
                        <p className="font-semibold">{t('net-flow')}: € {previous.net.toFixed(2)}</p>
                    </div>

                    <div className="rounded-xl border bg-muted/20 p-3 m-auto h-full min-w-[180px] w-full text-center">
                        <p className="text-muted-foreground">{t('net-variation')}</p>
                        <p className={netDifference >= 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {netDifference >= 0 ? '+' : ''}€ {netDifference.toFixed(2)}
                        </p>
                        <p className={netVariation >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                            ({netVariation >= 0 ? '+' : ''}{netVariation.toFixed(1)}%)
                        </p>
                    </div>
                </div>

                <div>
                    <p className="mb-3 text-sm text-muted-foreground">{t('net-trend-6m')}</p>
                    <ChartContainer
                        config={{
                            net: {
                                label: t('net-flow'),
                                color: 'hsl(var(--chart-1))',
                            },
                        }}
                        className="h-[250px] w-full"
                    >
                        <LineChart data={trendData} margin={{ left: 12, right: 12, top: 8, bottom: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickLine={false} axisLine={false} width={52} />
                            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                            <Line
                                type="monotone"
                                dataKey="net"
                                stroke="var(--color-net)"
                                strokeWidth={2}
                                dot={{ fill: 'var(--color-net)', r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );
}

export default MonthlyComparison;
