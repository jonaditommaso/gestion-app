import { cn } from "@/lib/utils";
import { differenceInDays, format } from "date-fns";
import { es, enUS, it } from "date-fns/locale";
import { useLocale } from "next-intl";

interface TaskDateProps {
    value: string,
    className?: string
}

const DATE_LOCALES = { es, en: enUS, it };

const TaskDate = ({ value, className }: TaskDateProps) => {
    const locale = useLocale() as 'es' | 'en' | 'it';

    const today = new Date();
    const endDate = new Date(value);
    const diffInDays = differenceInDays(endDate, today)

    let textColor = 'text-muted-foreground';

    if (diffInDays <= 3) {
        textColor = 'text-red-500'
    } else if (diffInDays <= 7) {
        textColor = 'text-orange-500'
    } else if  (diffInDays <= 14) {
        textColor = 'text-yellow-500'
    }

    return (
        <div className={textColor}>
            <span className={cn('truncate', className)}>
                {format(value, 'PPP', { locale: DATE_LOCALES[locale] })}
            </span>
        </div>
    );
}

export default TaskDate;