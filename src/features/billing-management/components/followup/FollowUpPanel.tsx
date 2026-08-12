'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import dayjs from "dayjs";
import { useGetOperations } from "../../api/use-get-operations";
import { useUpdateOperation } from "../../api/use-update-operation";
import { useCurrentUserPermissions } from "@/features/roles/hooks/useCurrentUserPermissions";
import { PERMISSIONS } from "@/features/roles/constants";
import { useAppContext } from "@/context/AppContext";
import { AlarmClockCheck, AlertCircle, CheckCircle2 } from "lucide-react";

interface BillingOperation {
    $id: string;
    $updatedAt: string;
    invoiceNumber?: string;
    category: string;
    dueDate?: string | Date;
    import: number;
    status?: 'PENDING' | 'PAID' | 'OVERDUE';
}

const FollowUpPanel = () => {
    const t = useTranslations('billing');
    const { data, isLoading } = useGetOperations();
    const { mutate: updateOperation, isPending } = useUpdateOperation();
    const { hasPermission } = useCurrentUserPermissions();
    const canWrite = hasPermission(PERMISSIONS.WRITE);
    const { isDemo } = useAppContext();

    const operations = useMemo(() => (data?.documents || []) as unknown as BillingOperation[], [data]);

    const todayStart = dayjs().startOf('day');
    const todayEnd = dayjs().endOf('day');
    const dueSoonEnd = dayjs().add(7, 'day').endOf('day');

    const dueSoon = useMemo(() => {
        return operations.filter((operation) => {
            if (operation.status !== 'PENDING' || !operation.dueDate) return false;
            const dueDate = dayjs(operation.dueDate);
            return (dueDate.isAfter(todayStart) || dueDate.isSame(todayStart, 'day')) && dueDate.isBefore(dueSoonEnd);
        });
    }, [operations, todayStart, dueSoonEnd]);

    const overdue = useMemo(() => {
        return operations.filter((operation) => {
            if (operation.status !== 'PENDING' || !operation.dueDate) return false;
            return dayjs(operation.dueDate).isBefore(todayStart);
        });
    }, [operations, todayStart]);

    const paidToday = useMemo(() => {
        return operations.filter((operation) => {
            if (operation.status !== 'PAID') return false;
            const updatedAt = dayjs(operation.$updatedAt);
            return updatedAt.isAfter(todayStart) && updatedAt.isBefore(todayEnd);
        });
    }, [operations, todayStart, todayEnd]);

    const markAsPaid = (operationId: string) => {
        if (isDemo) return;
        updateOperation({
            param: { billingId: operationId },
            json: { status: 'PAID' }
        });
    }

    const dueSoonTotal = useMemo(() => dueSoon.reduce((acc, operation) => acc + operation.import, 0), [dueSoon]);
    const overdueTotal = useMemo(() => overdue.reduce((acc, operation) => acc + operation.import, 0), [overdue]);
    const paidTodayTotal = useMemo(() => paidToday.reduce((acc, operation) => acc + operation.import, 0), [paidToday]);

    if (isLoading) {
        return null;
    }

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="border-border/80 bg-sidebar shadow-sm">
                <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-amber-700 dark:text-amber-400">{t('due-soon')}</CardTitle>
                        <span className="flex size-9 items-center justify-center rounded-lg bg-amber-100/80 dark:bg-amber-900/50">
                            <AlarmClockCheck className="size-4 text-amber-700 dark:text-amber-400" />
                        </span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-semibold tracking-tight">{dueSoon.length}</p>
                        <p className="text-sm text-muted-foreground">€ {dueSoonTotal.toFixed(2)}</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    {dueSoon.length === 0 && <p className="text-sm text-muted-foreground">{t('no-due-soon')}</p>}
                    {dueSoon.slice(0, 3).map((operation) => (
                        <div key={operation.$id} className="rounded-xl border border-amber-200/60 bg-amber-50/40 p-3 dark:border-amber-800/40 dark:bg-amber-950/20">
                            <p className="font-medium">{operation.invoiceNumber || operation.$id.slice(-6).toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground">{operation.category}</p>
                            <div className="mt-1 flex items-center justify-between text-sm">
                                <span>€ {operation.import.toFixed(2)}</span>
                                <span className="text-xs text-muted-foreground">{dayjs(operation.dueDate).format('DD/MM/YYYY')}</span>
                            </div>
                            {canWrite && (
                                <Button
                                    size="sm"
                                    className="mt-2 w-full"
                                    disabled={isPending || isDemo}
                                    onClick={() => markAsPaid(operation.$id)}
                                >
                                    {t('mark-as-paid')}
                                </Button>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="border-border/80 bg-sidebar shadow-sm">
                <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-red-700 dark:text-red-400">{t('overdue-ops')}</CardTitle>
                        <span className="flex size-9 items-center justify-center rounded-lg bg-red-100/80 dark:bg-red-900/50">
                            <AlertCircle className="size-4 text-red-700 dark:text-red-400" />
                        </span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-semibold tracking-tight">{overdue.length}</p>
                        <p className="text-sm text-muted-foreground">€ {overdueTotal.toFixed(2)}</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    {overdue.length === 0 && <p className="text-sm text-muted-foreground">{t('no-overdue')}</p>}
                    {overdue.slice(0, 3).map((operation) => (
                        <div key={operation.$id} className="rounded-xl border border-red-200/60 bg-red-50/40 p-3 dark:border-red-800/40 dark:bg-red-950/20">
                            <p className="font-medium">{operation.invoiceNumber || operation.$id.slice(-6).toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground">{operation.category}</p>
                            <div className="mt-1 flex items-center justify-between text-sm">
                                <span>€ {operation.import.toFixed(2)}</span>
                                <span className="text-xs text-muted-foreground">{dayjs(operation.dueDate).format('DD/MM/YYYY')}</span>
                            </div>
                            {canWrite && (
                                <Button
                                    size="sm"
                                    className="mt-2 w-full"
                                    disabled={isPending || isDemo}
                                    onClick={() => markAsPaid(operation.$id)}
                                >
                                    {t('mark-as-paid')}
                                </Button>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="border-border/80 bg-sidebar shadow-sm">
                <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-emerald-700 dark:text-emerald-400">{t('paid-today')}</CardTitle>
                        <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-100/80 dark:bg-emerald-900/50">
                            <CheckCircle2 className="size-4 text-emerald-700 dark:text-emerald-400" />
                        </span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-semibold tracking-tight">{paidToday.length}</p>
                        <p className="text-sm text-muted-foreground">€ {paidTodayTotal.toFixed(2)}</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    {paidToday.length === 0 && <p className="text-sm text-muted-foreground">{t('no-paid-today')}</p>}
                    {paidToday.slice(0, 3).map((operation) => (
                        <div key={operation.$id} className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-3 dark:border-emerald-800/40 dark:bg-emerald-950/20">
                            <p className="font-medium">{operation.invoiceNumber || operation.$id.slice(-6).toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground">{operation.category}</p>
                            <div className="mt-1 flex items-center justify-between text-sm">
                                <span>€ {operation.import.toFixed(2)}</span>
                                <span className="text-xs text-muted-foreground">{dayjs(operation.$updatedAt).format('DD/MM/YYYY HH:mm')}</span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

export default FollowUpPanel;
