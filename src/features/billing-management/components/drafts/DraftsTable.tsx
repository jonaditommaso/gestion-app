'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { useGetDrafts } from "../../api/use-get-drafts";
import { useUpdateOperation } from "../../api/use-update-operation";
import { useDeleteOperation } from "../../api/use-delete-operation";
import { useGetBillingOptions } from "../../api/use-get-billing-options";
import { useConfirm } from "@/hooks/use-confirm";
import { useQueryClient } from "@tanstack/react-query";
import { DialogContainer } from "@/components/DialogContainer";
import { cn } from "@/lib/utils";
import capitalize from "@/utils/capitalize";
import dayjs from "dayjs";
import { Eye, Pencil, Save, Send, Trash2, XIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { useCurrentUserPermissions } from "@/features/roles/hooks/useCurrentUserPermissions";
import { PERMISSIONS } from "@/features/roles/constants";
import CustomDatePicker from "@/components/CustomDatePicker";
import { toast } from "sonner";
import NoData from "@/components/NoData";

type BillingStatus = 'PENDING' | 'PAID' | 'OVERDUE';

interface DraftOperation {
    $id: string;
    type: 'income' | 'expense';
    date: string | Date;
    category: string;
    import: number;
    status?: BillingStatus;
    invoiceNumber?: string;
    currency?: string;
    partyName?: string;
    note?: string;
    dueDate?: string | Date;
    account?: string;
    paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'DIGITAL_WALLET' | 'OTHER';
    taxRate?: number;
    taxAmount?: number;
}

interface EditingDraft {
    id: string;
    date: string;
    dueDate: string;
    category: string;
    import: number;
    status: BillingStatus;
}

const DraftsTable = () => {
    const t = useTranslations('billing');
    const { data, isLoading } = useGetDrafts();
    const { data: billingOptionsData } = useGetBillingOptions();
    const { mutate: updateOperation, isPending: isUpdating } = useUpdateOperation();
    const { mutate: deleteOperation, isPending: isDeleting } = useDeleteOperation();
    const queryClient = useQueryClient();
    const { hasPermission } = useCurrentUserPermissions();
    const canWrite = hasPermission(PERMISSIONS.WRITE);
    const canDelete = hasPermission(PERMISSIONS.DELETE);

    const [editingDraft, setEditingDraft] = useState<EditingDraft | null>(null);
    const [detailsDraft, setDetailsDraft] = useState<DraftOperation | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const [DeleteDialog, confirmDelete] = useConfirm(
        t('confirm-delete-draft-title'),
        t('confirm-delete-draft'),
        'destructive'
    );

    const drafts = (data?.documents || []) as unknown as DraftOperation[];

    const incomeCategories = useMemo(() => billingOptionsData?.documents?.[0]?.incomeCategories || [], [billingOptionsData]);
    const expenseCategories = useMemo(() => billingOptionsData?.documents?.[0]?.expenseCategories || [], [billingOptionsData]);

    const getAvailableCategories = (draft: DraftOperation) => {
        const categoryList = draft.type === 'income' ? incomeCategories : expenseCategories;
        const current = draft.category ? [draft.category] : [];
        return Array.from(new Set([...categoryList, ...current]));
    };

    const isRowEditing = (id: string) => editingDraft?.id === id;

    const handleStartEdit = (draft: DraftOperation) => {
        setEditingDraft({
            id: draft.$id,
            date: dayjs(draft.date).format('YYYY-MM-DD'),
            dueDate: draft.dueDate ? dayjs(draft.dueDate).format('YYYY-MM-DD') : '',
            category: draft.category,
            import: draft.import,
            status: draft.status || 'PENDING',
        });
    };

    const handleSaveEdit = () => {
        if (!editingDraft) return;

        if (editingDraft.import < 0) {
            toast.error(t('amount-must-be-positive'));
            return;
        }

        if (editingDraft.dueDate && dayjs(editingDraft.dueDate).isBefore(dayjs(editingDraft.date), 'day')) {
            toast.error(t('due-date-must-be-after-date'));
            return;
        }

        updateOperation(
            {
                param: { billingId: editingDraft.id },
                json: {
                    date: new Date(editingDraft.date),
                    dueDate: editingDraft.dueDate ? new Date(editingDraft.dueDate) : undefined,
                    category: editingDraft.category,
                    import: editingDraft.import,
                    status: editingDraft.status,
                },
            },
            {
                onSuccess: () => {
                    setEditingDraft(null);
                    queryClient.invalidateQueries({ queryKey: ['billing-drafts'] });
                },
            }
        );
    };

    const handlePublish = (draftId: string) => {
        updateOperation(
            { param: { billingId: draftId }, json: { isDraft: false } },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['billing-drafts'] });
                },
            }
        );
    };

    const handleDelete = async (draftId: string) => {
        const ok = await confirmDelete();
        if (!ok) return;

        deleteOperation(
            { param: { billingId: draftId } },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['billing-drafts'] });
                },
            }
        );
    };

    const getRowClass = (draft: DraftOperation) => {
        if (isRowEditing(draft.$id)) return 'bg-zinc-200 dark:bg-zinc-800';
        return draft.type === 'income' ? 'bg-[#0bb31420]' : 'bg-[#f0341020]';
    };

    if (isLoading) return null;

    if (drafts.length === 0) return (
        <div className="w-full max-w-[800px]">
            <NoData title="no-drafts-data" description="add-draft-operation" />
        </div>
    );

    return (
        <div className="w-full max-w-[1050px]">
            <DeleteDialog />
            <DialogContainer
                title={t('operation-details-title')}
                isOpen={detailsOpen}
                setIsOpen={setDetailsOpen}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="font-semibold">{t('invoice')}:</span> {detailsDraft?.invoiceNumber || detailsDraft?.$id.slice(-6).toUpperCase() || '-'}</div>
                    <div><span className="font-semibold">{t('type')}:</span> {detailsDraft ? capitalize(detailsDraft.type) : '-'}</div>
                    <div><span className="font-semibold">{t('date')}:</span> {detailsDraft?.date ? dayjs(detailsDraft.date).format('DD/MM/YYYY HH:mm') : '-'}</div>
                    <div><span className="font-semibold">{t('due-date')}:</span> {detailsDraft?.dueDate ? dayjs(detailsDraft.dueDate).format('DD/MM/YYYY') : '-'}</div>
                    <div><span className="font-semibold">{t('category')}:</span> {detailsDraft?.category || '-'}</div>
                    <div><span className="font-semibold">{t('status')}:</span> {detailsDraft?.status ? t(detailsDraft.status.toLowerCase()) : '-'}</div>
                    <div><span className="font-semibold">{t('account')}:</span> {detailsDraft?.account || '-'}</div>
                    <div><span className="font-semibold">{t('currency')}:</span> {detailsDraft?.currency || 'EUR'}</div>
                    <div><span className="font-semibold">{t('party-name')}:</span> {detailsDraft?.partyName || '-'}</div>
                    <div><span className="font-semibold">{t('amount')}:</span> {detailsDraft?.currency || 'EUR'} {detailsDraft?.import ?? '-'}</div>
                    <div><span className="font-semibold">{t('payment-method')}:</span> {detailsDraft?.paymentMethod ? t(detailsDraft.paymentMethod.toLowerCase()) : '-'}</div>
                    <div><span className="font-semibold">{t('tax-rate')}:</span> {detailsDraft?.taxRate != null ? `${detailsDraft.taxRate}%` : '-'}</div>
                    <div><span className="font-semibold">{t('tax-amount')}:</span> {detailsDraft?.taxAmount != null ? `${detailsDraft.currency || 'EUR'} ${detailsDraft.taxAmount}` : '-'}</div>
                    <div className="md:col-span-2"><span className="font-semibold">{t('note')}:</span> {detailsDraft?.note || '-'}</div>
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
                        {drafts.map((draft) => (
                            <TableRow key={draft.$id} className={getRowClass(draft)}>
                                <TableCell className="font-medium">
                                    {draft.invoiceNumber || draft.$id.slice(-6).toUpperCase()}
                                </TableCell>
                                <TableCell>{capitalize(draft.type)}</TableCell>

                                <TableCell>
                                    {isRowEditing(draft.$id) ? (
                                        <Input
                                            type="date"
                                            className="bg-white"
                                            value={editingDraft?.date || ''}
                                            onChange={(e) => setEditingDraft((prev) => prev ? ({ ...prev, date: e.target.value }) : prev)}
                                        />
                                    ) : dayjs(draft.date).format('DD/MM/YYYY')}
                                </TableCell>

                                <TableCell>
                                    {isRowEditing(draft.$id) ? (
                                        <CustomDatePicker
                                            value={editingDraft?.dueDate ? dayjs(editingDraft.dueDate).toDate() : undefined}
                                            onChange={(date) => setEditingDraft((prev) => prev ? ({ ...prev, dueDate: dayjs(date).format('YYYY-MM-DD') }) : prev)}
                                            hideIcon
                                            onClear={() => setEditingDraft((prev) => prev ? ({ ...prev, dueDate: '' }) : prev)}
                                            clearButtonTitle={t('clear-filter-date')}
                                        />
                                    ) : (draft.dueDate ? dayjs(draft.dueDate).format('DD/MM/YYYY') : '-')}
                                </TableCell>

                                <TableCell>
                                    {isRowEditing(draft.$id) ? (
                                        <Select
                                            value={editingDraft?.category || draft.category}
                                            onValueChange={(value) => setEditingDraft((prev) => prev ? ({ ...prev, category: value }) : prev)}
                                        >
                                            <SelectTrigger className="bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getAvailableCategories(draft).map((cat) => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : capitalize(draft.category)}
                                </TableCell>

                                <TableCell>
                                    {isRowEditing(draft.$id) ? (
                                        <Select
                                            value={editingDraft?.status || 'PENDING'}
                                            onValueChange={(value: BillingStatus) => setEditingDraft((prev) => prev ? ({ ...prev, status: value }) : prev)}
                                        >
                                            <SelectTrigger className="bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PENDING">{t('pending')}</SelectItem>
                                                <SelectItem value="PAID">{t('paid')}</SelectItem>
                                                <SelectItem value="OVERDUE">{t('overdue')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : t((draft.status || 'PENDING').toLowerCase())}
                                </TableCell>

                                <TableCell className="text-right">
                                    {isRowEditing(draft.$id) ? (
                                        <Input
                                            type="number"
                                            min={0}
                                            className="bg-white text-right"
                                            value={editingDraft?.import ?? ''}
                                            onChange={(e) => {
                                                const v = e.target.value === '' ? 0 : Number(e.target.value);
                                                setEditingDraft((prev) => prev ? ({ ...prev, import: v }) : prev);
                                            }}
                                        />
                                    ) : <>{draft.currency || 'EUR'} {draft.import}</>}
                                </TableCell>

                                <TableCell className={cn(
                                    'sticky right-0 z-30 border-l-2 border-border shadow-[-8px_0_8px_-10px_rgba(0,0,0,0.35)]',
                                    isRowEditing(draft.$id) ? 'bg-zinc-200 dark:bg-zinc-800' : 'bg-background'
                                )}>
                                    <div className="flex items-center gap-1 justify-end">
                                        {isRowEditing(draft.$id) ? (
                                            <>
                                                <Button size="icon" variant="outline" onClick={handleSaveEdit} disabled={isUpdating} title={t('save')}>
                                                    <Save className="size-4" />
                                                </Button>
                                                <Button size="icon" variant="outline" onClick={() => setEditingDraft(null)} disabled={isUpdating} title={t('cancel')}>
                                                    <XIcon className="size-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    onClick={() => { setDetailsDraft(draft); setDetailsOpen(true); }}
                                                    title={t('view-details')}
                                                >
                                                    <Eye className="size-4" />
                                                </Button>
                                                {canWrite && (
                                                    <>
                                                        <Button size="icon" variant="outline" onClick={() => handleStartEdit(draft)} title={t('edit')}>
                                                            <Pencil className="size-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            disabled={isUpdating || isDeleting}
                                                            onClick={() => handlePublish(draft.$id)}
                                                            title={t('publish-draft')}
                                                        >
                                                            <Send className="size-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                {canDelete && (
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        disabled={isUpdating || isDeleting}
                                                        onClick={() => handleDelete(draft.$id)}
                                                        title={t('delete')}
                                                    >
                                                        <Trash2 className="size-4 text-red-500" />
                                                    </Button>
                                                )}
                                            </>
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

export default DraftsTable;