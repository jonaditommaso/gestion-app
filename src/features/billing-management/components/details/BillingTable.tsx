'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useGetOperations } from "../../api/use-get-operations"
import { useGetBillingOptions } from "../../api/use-get-billing-options"
import dayjs from 'dayjs'
import { cn } from "@/lib/utils"
import FadeLoader from "react-spinners/FadeLoader"
import capitalize from "@/utils/capitalize"
import { useDataBillingTable } from "../../hooks/useDataBillingTable"
import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { useDeleteOperation } from "../../api/use-delete-operation"
import { useUpdateOperation } from "../../api/use-update-operation"
import { Archive, ChevronDown, Download, Eye, MoreVertical, Pencil, Save, Trash2, XIcon } from "lucide-react"
import CustomDatePicker from "@/components/CustomDatePicker"
import { useConfirm } from "@/hooks/use-confirm"
import { DialogContainer } from "@/components/DialogContainer"
import { toast } from "sonner"

const headers = ['invoice', 'type', 'date', 'due-date', 'category', 'status', 'account', 'party-name', 'amount', 'actions']

type BillingStatus = 'PENDING' | 'PAID' | 'OVERDUE';

interface BillingOperation {
  $id: string;
  type: 'income' | 'expense';
  date: string | Date;
  category: string;
  import: number;
  status?: BillingStatus;
  invoiceNumber?: string;
  partyName?: string;
  note?: string;
  dueDate?: string | Date;
  account?: string;
  paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'DIGITAL_WALLET' | 'OTHER';
  currency?: string;
  taxRate?: number;
  taxAmount?: number;
  isRecurring?: boolean;
  recurrenceRule?: 'WEEKLY' | 'MONTHLY';
  nextOccurrenceDate?: string | Date;
  archived?: boolean;
}

interface EditingOperation {
  id: string;
  date: string;
  dueDate: string;
  category: string;
  import: number;
  status: BillingStatus;
}

export function BillingTable() {
  const { data, isLoading } = useGetOperations();
  const { data: billingOptionsData } = useGetBillingOptions();
  const { selectedData } = useDataBillingTable();
  const { mutate: deleteOperation, isPending: isDeleting } = useDeleteOperation();
  const { mutate: updateOperation, isPending: isUpdating } = useUpdateOperation();
  const t = useTranslations('billing')

  const [dataType, setDataType] = useState(selectedData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | BillingStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [operationDateFilter, setOperationDateFilter] = useState<Date | undefined>(undefined);
  const [dueDateFilter, setDueDateFilter] = useState<Date | undefined>(undefined);
  const [amountFrom, setAmountFrom] = useState('');
  const [amountTo, setAmountTo] = useState('');
  const [selectedExportFormat, setSelectedExportFormat] = useState<'csv' | 'excel'>('csv');
  const [editingOperation, setEditingOperation] = useState<EditingOperation | null>(null);
  const [detailsOperation, setDetailsOperation] = useState<BillingOperation | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [DeleteOperationDialog, confirmDelete] = useConfirm(
    t('confirm-delete-operation-title'),
    t('confirm-delete-operation'),
    'destructive'
  );

  const [ArchiveOperationDialog, confirmArchive] = useConfirm(
    t('confirm-archive-operation-title'),
    t('confirm-archive-operation'),
    'default'
  );

  useEffect(() => {
    setDataType(selectedData);
  }, [selectedData])

  const operations = useMemo(() => (data?.documents || []) as unknown as BillingOperation[], [data]);

  const categories = useMemo(() => {
    const currentViewType = selectedData === 'total' ? 'total' : dataType;

    const operationsByView = operations.filter((operation) => {
      if (operation.archived === true) {
        return false;
      }

      if (currentViewType === 'total') {
        return true;
      }

      return operation.type === currentViewType;
    });

    return Array.from(new Set(operationsByView.map((operation) => operation.category))).toSorted((a, b) => a.localeCompare(b));
  }, [operations, selectedData, dataType]);

  useEffect(() => {
    if (categoryFilter !== 'ALL' && !categories.includes(categoryFilter)) {
      setCategoryFilter('ALL');
    }
  }, [categoryFilter, categories]);

  const filteredData = useMemo(() => {
    return operations.filter((operation) => {
      if (operation.archived === true) {
        return false;
      }

      if (selectedData !== 'total' && operation.type !== dataType) {
        return false;
      }

      if (statusFilter !== 'ALL' && (operation.status || 'PENDING') !== statusFilter) {
        return false;
      }

      if (categoryFilter !== 'ALL' && operation.category !== categoryFilter) {
        return false;
      }

      const operationDate = dayjs(operation.date);

      if (operationDateFilter && !operationDate.isSame(dayjs(operationDateFilter), 'day')) {
        return false;
      }

      if (dueDateFilter) {
        if (!operation.dueDate) {
          return false;
        }

        const currentDueDate = dayjs(operation.dueDate);
        if (!currentDueDate.isSame(dayjs(dueDateFilter), 'day')) {
          return false;
        }
      }

      if (amountFrom && operation.import < Number(amountFrom)) {
        return false;
      }

      if (amountTo && operation.import > Number(amountTo)) {
        return false;
      }

      const term = searchTerm.trim().toLowerCase();

      if (!term) {
        return true;
      }

      const haystack = [
        operation.invoiceNumber,
        operation.partyName,
        operation.note,
        operation.category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    })
  }, [operations, selectedData, dataType, statusFilter, categoryFilter, operationDateFilter, dueDateFilter, amountFrom, amountTo, searchTerm]);

  const total = filteredData.reduce((acc, operation) => acc + (operation.type === 'income' ? operation.import : -operation.import), 0)

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setOperationDateFilter(undefined);
    setDueDateFilter(undefined);
    setAmountFrom('');
    setAmountTo('');
  }

  const handleStartEdit = (operation: BillingOperation) => {
    setEditingOperation({
      id: operation.$id,
      date: dayjs(operation.date).format('YYYY-MM-DD'),
      dueDate: operation.dueDate ? dayjs(operation.dueDate).format('YYYY-MM-DD') : '',
      category: operation.category,
      import: operation.import,
      status: operation.status || 'PENDING',
    });
  }

  const handleSaveEdit = () => {
    if (!editingOperation) return;

    if (editingOperation.import <= 0) {
      toast.error(t('amount-must-be-positive'));
      return;
    }

    if (editingOperation.dueDate && dayjs(editingOperation.dueDate).isBefore(dayjs(editingOperation.date), 'day')) {
      toast.error(t('due-date-must-be-after-date'));
      return;
    }

    updateOperation({
      param: { billingId: editingOperation.id },
      json: {
        date: new Date(editingOperation.date),
        dueDate: editingOperation.dueDate ? new Date(editingOperation.dueDate) : undefined,
        category: editingOperation.category,
        import: editingOperation.import,
        status: editingOperation.status,
      }
    }, {
      onSuccess: () => setEditingOperation(null)
    })
  }

  const isRowEditing = (operationId: string) => editingOperation?.id === operationId;

  const incomeCategories = useMemo(() => billingOptionsData?.documents?.[0]?.incomeCategories || [], [billingOptionsData]);
  const expenseCategories = useMemo(() => billingOptionsData?.documents?.[0]?.expenseCategories || [], [billingOptionsData]);

  const getAvailableCategories = (operation: BillingOperation) => {
    const categoryList = operation.type === 'income' ? incomeCategories : expenseCategories;
    const currentCategory = operation.category ? [operation.category] : [];
    return Array.from(new Set([...categoryList, ...currentCategory]));
  }

  const getStatusDotClass = (status: 'ALL' | BillingStatus) => {
    if (status === 'PAID') return 'bg-emerald-500';
    if (status === 'OVERDUE') return 'bg-red-500';
    if (status === 'PENDING') return 'bg-amber-500';
    return 'bg-zinc-400';
  }

  const getRowClass = (operation: BillingOperation) => {
    if (isRowEditing(operation.$id)) {
      return 'bg-zinc-200 dark:bg-zinc-800';
    }

    return operation.type === 'income'
      ? 'bg-[#0bb31420] hover:bg-green-500'
      : 'bg-[#f0341020] hover:bg-red-500';
  }

  const getStickyActionCellClass = (operation: BillingOperation) => {
    if (isRowEditing(operation.$id)) {
      return 'sticky right-0 z-30 border-l-2 border-border bg-zinc-200 dark:bg-zinc-800 shadow-[-8px_0_8px_-10px_rgba(0,0,0,0.35)]';
    }

    return 'sticky right-0 z-30 border-l-2 border-border bg-background shadow-[-8px_0_8px_-10px_rgba(0,0,0,0.35)]';
  }

  const openDetails = (operation: BillingOperation) => {
    setDetailsOperation(operation);
    setDetailsOpen(true);
  }

  const downloadOperationDocument = (operation: BillingOperation) => {
    const statusText = operation.status ? t(operation.status.toLowerCase()) : '-';
    const paymentMethodText = operation.paymentMethod ? t(operation.paymentMethod.toLowerCase()) : '-';
    const downloadedAt = dayjs().format('DD/MM/YYYY HH:mm');

    const html = `
      <html>
        <head>
          <title>${t('operation-document-title')}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { margin-bottom: 8px; }
            .meta { color: #666; margin-bottom: 20px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .item { padding: 8px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: 600; }
          </style>
        </head>
        <body>
          <h1>${t('operation-document-title')}</h1>
          <p class="meta">${t('downloaded-on')}: ${downloadedAt}</p>
          <div class="grid">
            <div class="item"><span class="label">${t('invoice')}:</span> ${operation.invoiceNumber || operation.$id.slice(-6).toUpperCase()}</div>
            <div class="item"><span class="label">${t('type')}:</span> ${capitalize(operation.type)}</div>
            <div class="item"><span class="label">${t('date')}:</span> ${dayjs(operation.date).format('DD/MM/YYYY HH:mm')}</div>
            <div class="item"><span class="label">${t('due-date')}:</span> ${operation.dueDate ? dayjs(operation.dueDate).format('DD/MM/YYYY') : '-'}</div>
            <div class="item"><span class="label">${t('status')}:</span> ${statusText}</div>
            <div class="item"><span class="label">${t('category')}:</span> ${operation.category}</div>
            <div class="item"><span class="label">${t('account')}:</span> ${operation.account || '-'}</div>
            <div class="item"><span class="label">${t('currency')}:</span> ${operation.currency || 'EUR'}</div>
            <div class="item"><span class="label">${t('amount')}:</span> € ${operation.import}</div>
            <div class="item"><span class="label">${t('party-name')}:</span> ${operation.partyName || '-'}</div>
            <div class="item"><span class="label">${t('payment-method')}:</span> ${paymentMethodText}</div>
            <div class="item"><span class="label">${t('tax-rate')}:</span> ${operation.taxRate != null ? `${operation.taxRate}%` : '-'}</div>
            <div class="item"><span class="label">${t('tax-amount')}:</span> ${operation.taxAmount != null ? `€ ${operation.taxAmount}` : '-'}</div>
            <div class="item" style="grid-column: span 2;"><span class="label">${t('note')}:</span> ${operation.note || '-'}</div>
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }

  const handleArchive = async (operation: BillingOperation) => {
    const ok = await confirmArchive();
    if (!ok) return;

    updateOperation({
      param: { billingId: operation.$id },
      json: { archived: true }
    })
  }

  const getRowsForExport = () => {
    return filteredData.map((operation) => ({
      invoice: operation.invoiceNumber || operation.$id.slice(-6).toUpperCase(),
      type: operation.type,
      date: dayjs(operation.date).format('YYYY-MM-DD HH:mm'),
      dueDate: operation.dueDate ? dayjs(operation.dueDate).format('YYYY-MM-DD') : '',
      category: operation.category,
      status: operation.status || 'PENDING',
      account: operation.account || '',
      paymentMethod: operation.paymentMethod || '',
      currency: operation.currency || 'EUR',
      taxRate: operation.taxRate ?? '',
      taxAmount: operation.taxAmount ?? '',
      isRecurring: operation.isRecurring ? 'YES' : 'NO',
      recurrenceRule: operation.recurrenceRule || '',
      nextOccurrenceDate: operation.nextOccurrenceDate ? dayjs(operation.nextOccurrenceDate).format('YYYY-MM-DD') : '',
      amount: operation.import,
      party: operation.partyName || '',
      note: operation.note || '',
    }))
  }

  const handleExportCsv = () => {
    const rows = getRowsForExport();

    const columns = ['invoice', 'type', 'date', 'dueDate', 'category', 'status', 'account', 'paymentMethod', 'currency', 'taxRate', 'taxAmount', 'isRecurring', 'recurrenceRule', 'nextOccurrenceDate', 'amount', 'party', 'note'];

    const csvHeader = columns.join(',');
    const csvBody = rows.map((row) => {
      return columns
        .map((column) => {
          const rawValue = String(row[column as keyof typeof row] ?? '');
          const escapedValue = rawValue.replace(/"/g, '""');
          return `"${escapedValue}"`;
        })
        .join(',');
    }).join('\n');

    const csvContent = `${csvHeader}\n${csvBody}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `billing-${dayjs().format('YYYYMMDD-HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const handleExportExcel = () => {
    const rows = getRowsForExport();

    const columns = ['Invoice', 'Type', 'Date', 'Due Date', 'Category', 'Status', 'Account', 'Payment Method', 'Currency', 'Tax Rate', 'Tax Amount', 'Recurring', 'Recurrence Rule', 'Next Occurrence', 'Amount', 'Party', 'Note'];

    const normalizeCell = (value: string | number) => String(value).replace(/\t|\r|\n/g, ' ');

    const lines = [
      columns.join('\t'),
      ...rows.map((row) => [
        row.invoice,
        row.type,
        row.date,
        row.dueDate,
        row.category,
        row.status,
        row.account,
        row.paymentMethod,
        row.currency,
        row.taxRate,
        row.taxAmount,
        row.isRecurring,
        row.recurrenceRule,
        row.nextOccurrenceDate,
        row.amount,
        row.party,
        row.note,
      ].map(normalizeCell).join('\t')),
    ];

    const excelContent = `\uFEFF${lines.join('\n')}`;
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `billing-${dayjs().format('YYYYMMDD-HHmm')}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const handleExportSelected = () => {
    if (selectedExportFormat === 'csv') {
      handleExportCsv();
      return;
    }

    handleExportExcel();
  }


  if(isLoading) return <FadeLoader color="#999" width={3} className="mt-5" />

  return (
    <div className="w-[95%] md:max-w-[1400px] sm:max-w-[1200px] mt-10 ml-14">
      <DeleteOperationDialog />
      <ArchiveOperationDialog />
      <DialogContainer
        title={t('operation-details-title')}
        isOpen={detailsOpen}
        setIsOpen={setDetailsOpen}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div><span className="font-semibold">{t('invoice')}:</span> {detailsOperation?.invoiceNumber || detailsOperation?.$id.slice(-6).toUpperCase() || '-'}</div>
          <div><span className="font-semibold">{t('type')}:</span> {detailsOperation ? capitalize(detailsOperation.type) : '-'}</div>
          <div><span className="font-semibold">{t('date')}:</span> {detailsOperation?.date ? dayjs(detailsOperation.date).format('DD/MM/YYYY HH:mm') : '-'}</div>
          <div><span className="font-semibold">{t('due-date')}:</span> {detailsOperation?.dueDate ? dayjs(detailsOperation.dueDate).format('DD/MM/YYYY') : '-'}</div>
          <div><span className="font-semibold">{t('category')}:</span> {detailsOperation?.category || '-'}</div>
          <div><span className="font-semibold">{t('status')}:</span> {detailsOperation?.status ? t(detailsOperation.status.toLowerCase()) : '-'}</div>
          <div><span className="font-semibold">{t('account')}:</span> {detailsOperation?.account || '-'}</div>
          <div><span className="font-semibold">{t('currency')}:</span> {detailsOperation?.currency || 'EUR'}</div>
          <div><span className="font-semibold">{t('party-name')}:</span> {detailsOperation?.partyName || '-'}</div>
          <div><span className="font-semibold">{t('amount')}:</span> € {detailsOperation?.import ?? '-'}</div>
          <div><span className="font-semibold">{t('payment-method')}:</span> {detailsOperation?.paymentMethod ? t(detailsOperation.paymentMethod.toLowerCase()) : '-'}</div>
          {/* Recurrence fields are intentionally hidden for now.
          <div><span className="font-semibold">{t('recurring-operation')}:</span> {detailsOperation?.isRecurring ? t('yes') : t('no')}</div>
          <div><span className="font-semibold">{t('recurrence-rule')}:</span> {detailsOperation?.recurrenceRule ? t(detailsOperation.recurrenceRule.toLowerCase()) : '-'}</div>
          <div><span className="font-semibold">{t('next-occurrence-date')}:</span> {detailsOperation?.nextOccurrenceDate ? dayjs(detailsOperation.nextOccurrenceDate).format('DD/MM/YYYY') : '-'}</div>
          */}
          <div><span className="font-semibold">{t('tax-rate')}:</span> {detailsOperation?.taxRate != null ? `${detailsOperation.taxRate}%` : '-'}</div>
          <div><span className="font-semibold">{t('tax-amount')}:</span> {detailsOperation?.taxAmount != null ? `€ ${detailsOperation.taxAmount}` : '-'}</div>
          <div className="md:col-span-2"><span className="font-semibold">{t('note')}:</span> {detailsOperation?.note || '-'}</div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="default"
            onClick={() => {
              if (detailsOperation) {
                downloadOperationDocument(detailsOperation)
              }
            }}
          >
            {t('download-document')}
          </Button>
          <Button variant="outline" onClick={() => setDetailsOpen(false)}>{t('close')}</Button>
        </div>
      </DialogContainer>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <Input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={t('search-placeholder')}
        />

        <Select value={statusFilter} onValueChange={(value: 'ALL' | BillingStatus) => setStatusFilter(value)}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <span className={cn('size-2 rounded-full', getStatusDotClass(statusFilter))} />
              <span>{statusFilter === 'ALL' ? t('all-statuses') : t(statusFilter.toLowerCase())}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              <div className="flex items-center gap-2">
                <span className={cn('size-2 rounded-full', getStatusDotClass('ALL'))} />
                <span>{t('all-statuses')}</span>
              </div>
            </SelectItem>
            <SelectItem value="PENDING">
              <div className="flex items-center gap-2">
                <span className={cn('size-2 rounded-full', getStatusDotClass('PENDING'))} />
                <span>{t('pending')}</span>
              </div>
            </SelectItem>
            <SelectItem value="PAID">
              <div className="flex items-center gap-2">
                <span className={cn('size-2 rounded-full', getStatusDotClass('PAID'))} />
                <span>{t('paid')}</span>
              </div>
            </SelectItem>
            <SelectItem value="OVERDUE">
              <div className="flex items-center gap-2">
                <span className={cn('size-2 rounded-full', getStatusDotClass('OVERDUE'))} />
                <span>{t('overdue')}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder={t('all-categories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('all-categories')}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <CustomDatePicker
          value={operationDateFilter}
          onChange={setOperationDateFilter}
          hideIcon
          label={t('operation-date-filter')}
          onClear={() => setOperationDateFilter(undefined)}
          clearButtonTitle={t('clear-filter-date')}
        />

        <CustomDatePicker
          value={dueDateFilter}
          onChange={setDueDateFilter}
          hideIcon
          label={t('due-date-filter')}
          onClear={() => setDueDateFilter(undefined)}
          clearButtonTitle={t('clear-filter-date')}
        />

        <Input
          type="number"
          min={0}
          step={0.01}
          value={amountFrom}
          onChange={(event) => setAmountFrom(event.target.value)}
          placeholder={t('amount-from')}
        />
        <Input
          type="number"
          min={0}
          step={0.01}
          value={amountTo}
          onChange={(event) => setAmountTo(event.target.value)}
          placeholder={t('amount-to')}
        />
        <Button variant="ghost" onClick={clearFilters}>{t('clear-filters')}</Button>
        <div className="md:col-span-2 lg:col-span-4 flex justify-end mt-4">
          <div className="flex items-center">
            <Button variant="default" className="rounded-r-none bg-emerald-700 hover:bg-emerald-800" onClick={handleExportSelected}>
              {selectedExportFormat === 'csv' ? t('export-csv') : t('export-excel')}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="icon" className="rounded-l-none border-l border-white/30 bg-emerald-700 hover:bg-emerald-800">
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedExportFormat('csv')}>{t('export-csv')}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedExportFormat('excel')}>{t('export-excel')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>


      <div className="overflow-x-auto rounded-md border p-2 mt-2">
        <Table className="min-w-[1500px]">
          <TableHeader>
            <TableRow>
              {headers.map(header => (
                <TableHead
                  key={header}
                  className={cn(
                    "w-[180px]",
                    header === 'type' && 'w-[74px] max-w-[74px]',
                    header === 'status' && 'w-[88px] max-w-[88px]',
                    header === 'amount' && 'text-right w-[90px] max-w-[90px]',
                    header === 'actions' && 'sticky right-0 z-30 border-l-2 border-border bg-background shadow-[-8px_0_8px_-10px_rgba(0,0,0,0.35)]'
                  )}
                >
                    {t(header)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map(operation => (
              <TableRow key={operation.$id} className={getRowClass(operation)}>
                <TableCell className="">{operation.invoiceNumber || operation.$id.slice(-6).toUpperCase()}</TableCell>
                <TableCell className="">{capitalize(operation.type)}</TableCell>

                <TableCell className="">
                  {isRowEditing(operation.$id) ? (
                    <Input
                      type="date"
                      className="bg-white"
                      value={editingOperation?.date || ''}
                      onChange={(event) => setEditingOperation((prev) => prev ? ({ ...prev, date: event.target.value }) : prev)}
                    />
                  ) : dayjs(operation.date).format('DD/MM/YYYY HH:mm')}
                </TableCell>

                <TableCell>
                  {isRowEditing(operation.$id) ? (
                    <CustomDatePicker
                      value={editingOperation?.dueDate ? dayjs(editingOperation.dueDate).toDate() : undefined}
                      onChange={(date) => setEditingOperation((prev) => prev ? ({ ...prev, dueDate: dayjs(date).format('YYYY-MM-DD') }) : prev)}
                      hideIcon
                      onClear={() => setEditingOperation((prev) => prev ? ({ ...prev, dueDate: '' }) : prev)}
                      clearButtonTitle={t('clear-filter-date')}
                    />
                  ) : (operation.dueDate ? dayjs(operation.dueDate).format('DD/MM/YYYY') : '-')}
                </TableCell>

                <TableCell className="">
                  {isRowEditing(operation.$id) ? (
                    <Select
                      value={editingOperation?.category || operation.category}
                      onValueChange={(value) => setEditingOperation((prev) => prev ? ({ ...prev, category: value }) : prev)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableCategories(operation).map((categoryOption) => (
                          <SelectItem key={categoryOption} value={categoryOption}>{categoryOption}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : operation.category}
                </TableCell>

                <TableCell className="">
                  {isRowEditing(operation.$id) ? (
                    <Select
                      value={editingOperation?.status || 'PENDING'}
                      onValueChange={(value: BillingStatus) => setEditingOperation((prev) => prev ? ({ ...prev, status: value }) : prev)}
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
                  ) : t((operation.status || 'PENDING').toLowerCase())}
                </TableCell>

                <TableCell>{operation.account || '-'}</TableCell>
                <TableCell>{operation.partyName || '-'}</TableCell>

                <TableCell className="text-right">
                  {isRowEditing(operation.$id) ? (
                    <Input
                      type="number"
                      min={0}
                      className="bg-white text-right"
                      value={editingOperation?.import ?? ''}
                      onChange={(event) => {
                        const valueAsNumber = event.target.value === '' ? 0 : Number(event.target.value);
                        setEditingOperation((prev) => prev ? ({ ...prev, import: valueAsNumber }) : prev)
                      }}
                    />
                  ) : <>$ {operation.import}</>}
                </TableCell>

                <TableCell className={getStickyActionCellClass(operation)}>
                  <div className="flex items-center gap-1 justify-end">
                    {isRowEditing(operation.$id) ? (
                      <>
                        <Button size="icon" variant="outline" onClick={handleSaveEdit} disabled={isUpdating} title={t('save')} aria-label={t('save')}>
                          <Save className="size-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => setEditingOperation(null)} disabled={isUpdating} title={t('cancel')} aria-label={t('cancel')}>
                          <XIcon className="size-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="icon" variant="outline" onClick={() => openDetails(operation)} title={t('view-details')} aria-label={t('view-details')}>
                          <Eye className="size-4" />
                        </Button>

                        <Button size="icon" variant="outline" onClick={() => downloadOperationDocument(operation)} title={t('download-document')} aria-label={t('download-document')}>
                          <Download className="size-4" />
                        </Button>

                        <Button size="icon" variant="outline" onClick={() => handleStartEdit(operation)} title={t('edit')} aria-label={t('edit')}>
                          <Pencil className="size-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              disabled={isDeleting || isUpdating}
                              title={t('more-actions')}
                              aria-label={t('more-actions')}
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleArchive(operation)}>
                              <Archive className="size-4 mr-2" />
                              {t('archive')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                const shouldDelete = await confirmDelete();
                                if (shouldDelete) {
                                  deleteOperation({ param: { billingId: operation.$id } })
                                }
                              }}
                            >
                              <Trash2 className="size-4 mr-2 text-red-600" />
                              {t('delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={8}>{t('total')}</TableCell>
              <TableCell className="text-right">$ {total}</TableCell>
              <TableCell className="sticky right-0 z-30 border-l-2 border-border bg-background" />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <p className="mt-4 text-muted-foreground flex justify-center">{t('recent-invoices-list')}</p>
    </div>
  )
}
