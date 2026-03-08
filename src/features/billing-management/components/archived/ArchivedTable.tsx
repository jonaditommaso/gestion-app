'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useGetArchived } from "../../api/use-get-archived";
import { useUpdateOperation } from "../../api/use-update-operation";
import { useQueryClient } from "@tanstack/react-query";
import { DialogContainer } from "@/components/DialogContainer";
import capitalize from "@/utils/capitalize";
import dayjs from "dayjs";
import { ArchiveRestore, Eye } from "lucide-react";
import { useState } from "react";
import { useCurrentUserPermissions } from "@/features/roles/hooks/useCurrentUserPermissions";
import { PERMISSIONS } from "@/features/roles/constants";
import NoData from "@/components/NoData";
import { cn } from "@/lib/utils";

interface ArchivedOperation {
    $id: string;
    type: 'income' | 'expense';
    date: string | Date;
    category: string;
    import: number;
    status?: string;
    invoiceNumber?: string;
    currency?: string;
    partyName?: string;
    note?: string;
    dueDate?: string | Date;
    account?: string;
    paymentMethod?: string;
    taxRate?: number;
    taxAmount?: number;
}

const ArchivedTable = () => {
    const t = useTranslations('billing');
    const { data, isLoading } = useGetArchived();
    const { mutate: updateOperation, isPending: isUpdating } = useUpdateOperation();
    const queryClient = useQueryClient();
    const { hasPermission } = useCurrentUserPermissions();
    const canWrite = hasPermission(PERMISSIONS.WRITE);

    const [detailsOp, setDetailsOp] = useState<ArchivedOperation | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const operations = (data?.documents || []) as unknown as ArchivedOperation[];

    const handleRestore = (opId: string) => {
        updateOperation(
            { param: { billingId: opId }, json: { isArchived: false } },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['billing-archived'] });
                    queryClient.invalidateQueries({ queryKey: ['billing'] });
                },
            }
        );
    };

    if (isLoading) return null;

    if (operations.length === 0) return (
        <div className="w-full max-w-[800px]">
            <NoData title="no-archived-data" description="add-archived-description" />
        </div>
    );

    return (
        <div className="w-full max-w-[1050px]">
            <DialogContainer
                title={t('operation-details-title')}
                isOpen={detailsOpen}
                setIsOpen={setDetailsOpen}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="font-semibold">{t('invoice')}:</span> {detailsOp?.invoiceNumber || detailsOp?.$id.slice(-6).toUpperCase() || '-'}</div>
                    <div><span className="font-semibold">{t('type')}:</span> {detailsOp ? capitalize(detailsOp.type) : '-'}</div>
                    <div><span className="font-semibold">{t('date')}:</span> {detailsOp?.date ? dayjs(detailsOp.date).format('DD/MM/YYYY HH:mm') : '-'}</div>
                    <div><span className="font-semibold">{t('due-date')}:</span> {detailsOp?.dueDate ? dayjs(detailsOp.dueDate).format('DD/MM/YYYY') : '-'}</div>
                    <div><span className="font-semibold">{t('category')}:</span> {detailsOp?.category || '-'}</div>
                    <div><span className="font-semibold">{t('status')}:</span> {detailsOp?.status ? t(detailsOp.status.toLowerCase()) : '-'}</div>
                    <div><span className="font-semibold">{t('account')}:</span> {detailsOp?.account || '-'}</div>
                    <div><span className="font-semibold">{t('currency')}:</span> {detailsOp?.currency || 'EUR'}</div>
                    <div><span className="font-semibold">{t('party-name')}:</span> {detailsOp?.partyName || '-'}</div>
                    <div><span className="font-semibold">{t('amount')}:</span> {detailsOp?.currency || 'EUR'} {detailsOp?.import ?? '-'}</div>
                    <div><span className="font-semibold">{t('payment-method')}:</span> {detailsOp?.paymentMethod ? t(detailsOp.paymentMethod.toLowerCase()) : '-'}</div>
                    <div><span className="font-semibold">{t('tax-rate')}:</span> {detailsOp?.taxRate != null ? `${detailsOp.taxRate}%` : '-'}</div>
                    <div><span className="font-semibold">{t('tax-amount')}:</span> {detailsOp?.taxAmount != null ? `${detailsOp.currency || 'EUR'} ${detailsOp.taxAmount}` : '-'}</div>
                    <div className="md:col-span-2"><span className="font-semibold">{t('note')}:</span> {detailsOp?.note || '-'}</div>
                </div>
                <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setDetailsOpen(false)}>{t('close')}</Button>
                </div>
            </DialogContainer>

            <div className="overflow-x-auto rounded-md border p-2">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('invoice')}</TableHead>
                            <TableHead>{t('type')}</TableHead>
                            <TableHead>{t('date')}</TableHead>
                            <TableHead>{t('due-date')}</TableHead>
                            <TableHead>{t('category')}</TableHead>
                            <TableHead>{t('status')}</TableHead>
                            <TableHead className="text-right">{t('amount')}</TableHead>
                            <TableHead className="sticky right-0 z-30 border-l-2 border-border bg-background shadow-[-8px_0_8px_-10px_rgba(0,0,0,0.35)]">{t('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {operations.map((op) => (
                            <TableRow
                                key={op.$id}
                                className={cn(
                                    op.type === 'income' ? 'bg-[#0bb31420]' : 'bg-[#f0341020]'
                                )}
                            >
                                <TableCell className="font-medium">
                                    {op.invoiceNumber || op.$id.slice(-6).toUpperCase()}
                                </TableCell>
                                <TableCell>{capitalize(op.type)}</TableCell>
                                <TableCell>{dayjs(op.date).format('DD/MM/YYYY')}</TableCell>
                                <TableCell>{op.dueDate ? dayjs(op.dueDate).format('DD/MM/YYYY') : '-'}</TableCell>
                                <TableCell>{capitalize(op.category)}</TableCell>
                                <TableCell>{op.status ? t(op.status.toLowerCase()) : '-'}</TableCell>
                                <TableCell className="text-right">{op.currency || 'EUR'} {op.import}</TableCell>
                                <TableCell className="sticky right-0 z-30 border-l-2 border-border bg-background shadow-[-8px_0_8px_-10px_rgba(0,0,0,0.35)]">
                                    <div className="flex items-center gap-1 justify-end">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            onClick={() => { setDetailsOp(op); setDetailsOpen(true); }}
                                            title={t('view-details')}
                                        >
                                            <Eye className="size-4" />
                                        </Button>
                                        {canWrite && (
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                disabled={isUpdating}
                                                onClick={() => handleRestore(op.$id)}
                                                title={t('restore')}
                                            >
                                                <ArchiveRestore className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default ArchivedTable;
