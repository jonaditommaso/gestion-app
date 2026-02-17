'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import dayjs from "dayjs";
import { useGetOperations } from "../../api/use-get-operations";
import { useUpdateOperation } from "../../api/use-update-operation";

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
        updateOperation({
            param: { billingId: operationId },
            json: { status: 'PAID' }
        });
    }

    if (isLoading) {
        return null;
    }

    return (
        <div className="w-full max-w-[1050px] grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-amber-600">{t('due-soon')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {dueSoon.length === 0 && <p className="text-sm text-muted-foreground">{t('no-due-soon')}</p>}
                    {dueSoon.map((operation) => (
                        <div key={operation.$id} className="border rounded-md p-2">
                            <p className="font-medium">{operation.invoiceNumber || operation.$id.slice(-6).toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground">{operation.category}</p>
                            <p className="text-sm">€ {operation.import}</p>
                            <p className="text-xs text-muted-foreground">{dayjs(operation.dueDate).format('DD/MM/YYYY')}</p>
                            <Button
                                size="sm"
                                className="mt-2 w-full"
                                disabled={isPending}
                                onClick={() => markAsPaid(operation.$id)}
                            >
                                {t('mark-as-paid')}
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-red-600">{t('overdue-ops')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {overdue.length === 0 && <p className="text-sm text-muted-foreground">{t('no-overdue')}</p>}
                    {overdue.map((operation) => (
                        <div key={operation.$id} className="border rounded-md p-2">
                            <p className="font-medium">{operation.invoiceNumber || operation.$id.slice(-6).toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground">{operation.category}</p>
                            <p className="text-sm">€ {operation.import}</p>
                            <p className="text-xs text-muted-foreground">{dayjs(operation.dueDate).format('DD/MM/YYYY')}</p>
                            <Button
                                size="sm"
                                className="mt-2 w-full"
                                disabled={isPending}
                                onClick={() => markAsPaid(operation.$id)}
                            >
                                {t('mark-as-paid')}
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-green-600">{t('paid-today')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {paidToday.length === 0 && <p className="text-sm text-muted-foreground">{t('no-paid-today')}</p>}
                    {paidToday.map((operation) => (
                        <div key={operation.$id} className="border rounded-md p-2">
                            <p className="font-medium">{operation.invoiceNumber || operation.$id.slice(-6).toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground">{operation.category}</p>
                            <p className="text-sm">€ {operation.import}</p>
                            <p className="text-xs text-muted-foreground">{dayjs(operation.$updatedAt).format('DD/MM/YYYY HH:mm')}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

export default FollowUpPanel;
