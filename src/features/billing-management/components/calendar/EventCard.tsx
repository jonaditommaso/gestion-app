import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface EventCardProps {
    category: string,
    importValue: number,
    type: string,
    invoice?: string,
    status?: 'PENDING' | 'PAID' | 'OVERDUE'
}

const typeColor = {
    income: 'text-green-500',
    expense: 'text-red-500',
}

const statusColor = {
    PENDING: 'text-amber-600',
    PAID: 'text-emerald-600',
    OVERDUE: 'text-red-600'
}

const EventCard = ({ category, importValue, type, invoice, status = 'PENDING' }: EventCardProps) => {
    const t = useTranslations('billing')

    return (
        <div className="px-2 py-1 mb-1 rounded-md border bg-background/80 hover:bg-muted/60 cursor-pointer transition-colors">
            <div className="flex items-center justify-between gap-2">
                <p className={cn(typeColor[type as keyof typeof typeColor], 'font-semibold text-xs truncate')}>{category}</p>
                <p className={cn(typeColor[type as keyof typeof typeColor], 'text-xs font-medium whitespace-nowrap')}>€ {importValue}</p>
            </div>
            <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className="text-[10px] text-muted-foreground truncate">{invoice || '-'}</p>
                <p className={cn('text-[10px] font-medium', statusColor[status])}>{t(status.toLowerCase())}</p>
            </div>
        </div>
    );
}

export default EventCard;