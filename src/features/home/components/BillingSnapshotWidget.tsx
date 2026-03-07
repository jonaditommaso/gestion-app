'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetOperations } from "@/features/billing-management/api/use-get-operations";
import { useTranslations } from "next-intl";
import { TrendingUp, TrendingDown, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

type BillingOperation = {
    type: 'income' | 'expense';
    import: number;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
    date: string;
    currency: string;
    dueDate?: string | null;
};

const BillingSnapshotWidget = () => {
    const t = useTranslations('home');
    const { data, isLoading } = useGetOperations();

    const stats = useMemo(() => {
        if (!data?.documents) {
            return { income: 0, expenses: 0, overdueCount: 0, currency: '' };
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const thisMonthOps = (data.documents as unknown as BillingOperation[]).filter((op) => {
            const opDate = new Date(op.date);
            return opDate.getMonth() === currentMonth && opDate.getFullYear() === currentYear;
        });

        const income = thisMonthOps
            .filter((op) => op.type === 'income')
            .reduce((acc, op) => acc + (op.import ?? 0), 0);

        const expenses = thisMonthOps
            .filter((op) => op.type === 'expense')
            .reduce((acc, op) => acc + (op.import ?? 0), 0);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const overdueCount = (data.documents as unknown as BillingOperation[]).filter(
            (op) => op.status === 'PENDING' && op.dueDate != null && new Date(op.dueDate) < todayStart
        ).length;

        const currencyCounts = (data.documents as unknown as BillingOperation[]).reduce<Record<string, number>>(
            (acc, op) => {
                if (op.currency) {
                    acc[op.currency] = (acc[op.currency] ?? 0) + 1;
                }
                return acc;
            },
            {}
        );

        const dominantCurrency = Object.entries(currencyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

        return { income, expenses, overdueCount, currency: dominantCurrency };
    }, [data]);

    if (isLoading) {
        return (
            <Card className="col-span-1">
                <CardHeader>
                    <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-6 w-24" />
                </CardContent>
            </Card>
        );
    }

    const formatAmount = (amount: number) => {
        return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <Card className="col-span-1">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span>{t('billing-snapshot-title')}</span>
                    <Link
                        href="/billing-management"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                        {t('billing-snapshot-view-all')}
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="h-4 w-4 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">{t('billing-snapshot-income')}</span>
                    </div>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {stats.currency} {formatAmount(stats.income)}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400">
                        <TrendingDown className="h-4 w-4 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">{t('billing-snapshot-expenses')}</span>
                    </div>
                    <span className="text-sm font-medium text-rose-500 dark:text-rose-400">
                        {stats.currency} {formatAmount(stats.expenses)}
                    </span>
                </div>

                {stats.overdueCount > 0 && (
                    <div className="flex items-center gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span className="text-xs font-medium">
                            {t('billing-snapshot-overdue', { count: stats.overdueCount })}
                        </span>
                    </div>
                )}

                {stats.overdueCount === 0 && (
                    <p className="text-xs text-muted-foreground">
                        {t('billing-snapshot-no-overdue')}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default BillingSnapshotWidget;
