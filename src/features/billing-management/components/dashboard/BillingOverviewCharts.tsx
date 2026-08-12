'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useGetOperations } from "../../api/use-get-operations";
import { useMemo } from "react";
import dayjs from "dayjs";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useTranslations } from "next-intl";

interface BillingOperation {
    type: 'income' | 'expense';
    status?: 'PENDING' | 'PAID' | 'OVERDUE';
    date: string | Date;
    import: number;
}

const BillingOverviewCharts = () => {
    const { data } = useGetOperations();
    const t = useTranslations('billing');

    const operations = useMemo(() => (data?.documents || []) as unknown as BillingOperation[], [data]);

    const flowData = useMemo(() => {
        return Array.from({ length: 6 }).map((_, index) => {
            const monthDate = dayjs().subtract(5 - index, 'month');
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
                month: monthDate.format('MMM'),
                incomes: Number(incomes.toFixed(2)),
                expenses: Number(expenses.toFixed(2)),
            };
        });
    }, [operations]);

    const statusData = useMemo(() => {
        const base = [
            { key: 'pending', value: 0, fill: 'hsl(var(--chart-3))' },
            { key: 'paid', value: 0, fill: 'hsl(var(--chart-2))' },
            { key: 'overdue', value: 0, fill: 'hsl(var(--destructive))' },
        ];

        operations.forEach((operation) => {
            const currentStatus = operation.status || 'PENDING';

            if (currentStatus === 'PENDING') base[0].value += 1;
            if (currentStatus === 'PAID') base[1].value += 1;
            if (currentStatus === 'OVERDUE') base[2].value += 1;
        });

        return base.map((item) => ({
            ...item,
            label: t(item.key),
        }));
    }, [operations, t]);

    return (
        <div className="grid w-full grid-cols-1 gap-4 xl:grid-cols-5">
            <Card className="xl:col-span-3 border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">{t('incomes-vs-expenses-6m')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer
                        config={{
                            incomes: { label: t('incomes'), color: 'hsl(var(--chart-2))' },
                            expenses: { label: t('expenses'), color: 'hsl(var(--destructive))' },
                        }}
                        className="h-[260px] w-full"
                    >
                        <LineChart data={flowData} margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickLine={false} axisLine={false} width={52} />
                            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                            <Line type="monotone" dataKey="incomes" stroke="var(--color-incomes)" strokeWidth={2.4} dot={false} />
                            <Line type="monotone" dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2.4} dot={false} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card className="xl:col-span-2 border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">{t('status-distribution')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer
                        config={{
                            value: { label: t('operations'), color: 'hsl(var(--chart-1))' },
                        }}
                        className="h-[260px] w-full"
                    >
                        <BarChart data={statusData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="hsl(var(--chart-1))" />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}

export default BillingOverviewCharts;
