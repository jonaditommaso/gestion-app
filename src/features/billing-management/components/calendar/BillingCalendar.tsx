'use client'
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { enUS, es, it } from "date-fns/locale";
import { addMonths, format, getDay, parse, startOfWeek, subMonths } from "date-fns";
import { useState } from "react";

import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/features/tasks/styles/date-calendar.css'
import CustomToolbar from "@/features/tasks/components/CustomToolbar";
import EventCard from "./EventCard";
import { useGetOperations } from "../../api/use-get-operations";
import FadeLoader from "react-spinners/FadeLoader";
import { DialogContainer } from "@/components/DialogContainer";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import capitalize from "@/utils/capitalize";
import dayjs from "dayjs";

const locales = {
    'en-US': enUS,
    'es': es,
    'it': it
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales
})

interface BillingOperationEvent {
        $id: string;
        start: Date;
        end: Date;
        category: string;
        import: number;
        type: 'income' | 'expense';
        status?: 'PENDING' | 'PAID' | 'OVERDUE';
        invoiceNumber?: string;
        date: string | Date;
        dueDate?: string | Date;
        account?: string;
        currency?: string;
        partyName?: string;
        paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'DIGITAL_WALLET' | 'OTHER';
        taxRate?: number;
        taxAmount?: number;
        note?: string;
}

const BillingCalendar = () => {
        const t = useTranslations('billing');
    const { data, isLoading } = useGetOperations();
    const operations = data?.documents || [];
        const [detailsOperation, setDetailsOperation] = useState<BillingOperationEvent | null>(null);
        const [detailsOpen, setDetailsOpen] = useState(false);

    const [value, setValue] = useState(operations.length > 0 ? new Date(operations[0].date) : new Date())

        const events = operations.length > 0 ? operations.map((operation) => ({
                $id: operation.$id,
        start: new Date(operation.date),
        end: new Date(operation.date),
        category: operation.category,
        import: operation.import,
                type: operation.type,
                status: operation.status,
                invoiceNumber: operation.invoiceNumber,
                date: operation.date,
                dueDate: operation.dueDate,
                account: operation.account,
                currency: operation.currency,
                partyName: operation.partyName,
                paymentMethod: operation.paymentMethod,
                taxRate: operation.taxRate,
                taxAmount: operation.taxAmount,
                note: operation.note,
    })) : []

        const openDetails = (operation: BillingOperationEvent) => {
                setDetailsOperation(operation);
                setDetailsOpen(true);
        }

        const downloadOperationDocument = (operation: BillingOperationEvent) => {
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

    const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
        if (action === 'PREV') {
            setValue(subMonths(value, 1))
        } else if (action === 'NEXT') {
            setValue(addMonths(value, 1))
        } else if (action === 'TODAY') {
            setValue(new Date())
        }
    }

    if(isLoading) return <FadeLoader color="#999" width={3} className="mt-5" />

    return (
        <>
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

            <Calendar
                localizer={localizer}
                events={events}
                views={['month']}
                defaultView="month"
                date={value}
                toolbar
                showAllEvents
                className="h-full w-[80%] m-auto"
                max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
                onSelectEvent={(event) => openDetails(event as BillingOperationEvent)}
                eventPropGetter={() => ({
                    style: {
                        backgroundColor: 'transparent',
                        border: 'none',
                        boxShadow: 'none',
                        padding: 0,
                    }
                })}
                formats={{
                    weekdayFormat: (date, culture, localizer) => localizer?.format(date, 'EEEE', culture) ?? '',
                }}
                components={{
                    event: ({ event }) => (
                        <EventCard
                            category={event.category}
                            importValue={event.import}
                            type={event.type}
                            invoice={event.invoiceNumber || event.$id?.slice(-6).toUpperCase()}
                            status={event.status || 'PENDING'}
                        />
                    ),
                    toolbar: () => <CustomToolbar date={value} onNavigate={handleNavigate} />
                }}
            />
        </>
    );
}

export default BillingCalendar;