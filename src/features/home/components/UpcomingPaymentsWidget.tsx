'use client'
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetOperations } from "@/features/billing-management/api/use-get-operations";
import { useTranslations } from "next-intl";
import { ArrowDownCircle, CalendarClock } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";

type BillingOperation = {
    $id: string;
    type: 'income' | 'expense';
    import: number;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
    dueDate?: string | null;
    partyName?: string | null;
    currency: string;
};

const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const UpcomingPaymentsWidget = () => {
    const t = useTranslations('home');
    const { data, isLoading } = useGetOperations();

    const upcomingPayments = useMemo(() => {
        if (!data?.documents) return [];

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        return (data.documents as unknown as BillingOperation[])
            .filter(
                (op) =>
                    op.type === 'income' &&
                    op.status === 'PENDING' &&
                    op.dueDate != null &&
                    new Date(op.dueDate) >= todayStart
            )
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
            .slice(0, 5);
    }, [data]);

    if (isLoading) {
        return (
            <Card className="col-span-1">
                <CardHeader>
                    <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-2/3" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm font-semibold">
                        {t('upcoming-payments-title')}
                    </CardTitle>
                    <Link
                        href="/billing-management"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                    >
                        {t('upcoming-payments-view-all')}
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="space-y-0">
                {upcomingPayments.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-1 text-center">
                        {t('upcoming-payments-empty')}
                    </p>
                ) : (
                    <div className="space-y-0.5">
                        {upcomingPayments.map((op) => (
                            <div
                                key={op.$id}
                                className="flex items-center justify-between py-1.5 px-1 rounded-md hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <ArrowDownCircle className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-semibold">
                                            {formatCurrency(op.import, op.currency)}
                                        </span>
                                        {op.partyName && (
                                            <span className="text-[10px] text-muted-foreground truncate">
                                                {op.partyName}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                                    <CalendarClock className="h-3 w-3" />
                                    <span className="text-[10px]">
                                        {dayjs(op.dueDate!).format('D MMM')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default UpcomingPaymentsWidget;
