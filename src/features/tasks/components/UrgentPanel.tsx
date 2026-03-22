'use client'
import { useTranslations, useLocale } from "next-intl";
import { FlameIcon, CheckCircle2Icon } from "lucide-react";
import { Task } from "../types";
import { formatDuration, intervalToDuration } from "date-fns";
import { es, enUS, it } from "date-fns/locale";
import { cn } from "@/lib/utils";

const DATE_LOCALES = { es, en: enUS, it };

interface UrgentPanelProps {
    task: Task;
}

export const UrgentPanel = ({ task }: UrgentPanelProps) => {
    const t = useTranslations('workspaces');
    const locale = useLocale() as 'es' | 'en' | 'it';

    const start = new Date(task.$createdAt);
    const end = task.completedAt ? new Date(task.completedAt) : new Date();
    const isResolved = !!task.completedAt;

    const duration = intervalToDuration({ start, end });
    const formattedDuration = formatDuration(duration, {
        format: ['days', 'hours', 'minutes'],
        locale: DATE_LOCALES[locale],
        delimiter: ', ',
    }) || '< 1 min';

    return (
        <div className={cn(
            "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm",
            isResolved
                ? "bg-green-50/60 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                : "bg-orange-50/60 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400"
        )}>
            {isResolved ? (
                <CheckCircle2Icon className="size-3.5 shrink-0" />
            ) : (
                <FlameIcon className="size-3.5 shrink-0" />
            )}
            <span className="text-xs font-medium">
                {isResolved ? t('urgent-resolved-in') : t('urgent-open-since')}
            </span>
            <span className="text-xs font-semibold">{formattedDuration}</span>
        </div>
    );
};
