'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useGetOperations } from "../../api/use-get-operations";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useTranslations } from "next-intl";

interface BillingOperation {
    category: string;
    import: number;
    status?: 'PENDING' | 'PAID' | 'OVERDUE';
    dueDate?: string | Date;
}

const BillingAnalyticsWorkspace = () => {
    const t = useTranslations('billing');
    const { data } = useGetOperations();

    const operations = useMemo(() => (data?.documents || []) as unknown as BillingOperation[], [data]);

    const metrics = useMemo(() => {
        const operationsCount = operations.length;
        const totalAmount = operations.reduce((acc, operation) => acc + operation.import, 0);
        const overdueCount = operations.filter((operation) => operation.status === 'OVERDUE').length;
        const pendingAmount = operations
            .filter((operation) => (operation.status || 'PENDING') === 'PENDING')
            .reduce((acc, operation) => acc + operation.import, 0);

        const avgTicket = operationsCount > 0 ? totalAmount / operationsCount : 0;
        const overdueRate = operationsCount > 0 ? (overdueCount / operationsCount) * 100 : 0;

        return {
            avgTicket,
            overdueRate,
            pendingAmount,
        };
    }, [operations]);

    const topCategories = useMemo(() => {
        const grouped = operations.reduce<Record<string, number>>((acc, operation) => {
            acc[operation.category] = (acc[operation.category] || 0) + operation.import;
            return acc;
        }, {});

        return Object.entries(grouped)
            .map(([category, amount]) => ({ category, amount: Number(amount.toFixed(2)) }))
            .toSorted((a, b) => b.amount - a.amount)
            .slice(0, 6);
    }, [operations]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Card className="border-border/80">
                    <CardHeader className="pb-2">
                        <CardDescription>{t('avg-ticket')}</CardDescription>
                        <CardTitle className="text-2xl">€ {metrics.avgTicket.toFixed(2)}</CardTitle>
                    </CardHeader>
                </Card>

                <Card className="border-border/80">
                    <CardHeader className="pb-2">
                        <CardDescription>{t('overdue-rate')}</CardDescription>
                        <CardTitle className="text-2xl">{metrics.overdueRate.toFixed(1)}%</CardTitle>
                    </CardHeader>
                </Card>

                <Card className="border-border/80">
                    <CardHeader className="pb-2">
                        <CardDescription>{t('pending-amount')}</CardDescription>
                        <CardTitle className="text-2xl">€ {metrics.pendingAmount.toFixed(2)}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
                <Card className="xl:col-span-3 border-border/80">
                    <CardHeader>
                        <CardTitle className="text-base">{t('analytics-roadmap-title')}</CardTitle>
                        <CardDescription>{t('analytics-roadmap-description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between rounded-xl border border-dashed border-muted/70 bg-muted/20 px-3 py-2">
                            <span className="text-sm">{t('reports-builder')}</span>
                            <Badge variant="outline">{t('planned')}</Badge>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-dashed border-muted/70 bg-muted/20 px-3 py-2">
                            <span className="text-sm">{t('cashflow-simulations')}</span>
                            <Badge variant="outline">{t('planned')}</Badge>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-dashed border-muted/70 bg-muted/20 px-3 py-2">
                            <span className="text-sm">{t('smart-alerts')}</span>
                            <Badge variant="outline">{t('planned')}</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="xl:col-span-2 border-border/80">
                    <CardHeader>
                        <CardTitle className="text-base">{t('top-categories-amount')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                amount: { label: t('amount'), color: 'hsl(var(--chart-1))' },
                            }}
                            className="h-[260px] w-full"
                        >
                            <BarChart data={topCategories} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="category" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickLine={false} axisLine={false} width={40} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="amount" fill="var(--color-amount)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default BillingAnalyticsWorkspace;
