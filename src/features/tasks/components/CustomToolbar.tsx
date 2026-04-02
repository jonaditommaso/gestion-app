import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Locale } from "date-fns";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { CalendarViewType, CalendarDateModeType } from "@/app/workspaces/constants/workspace-config-keys";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface CustomToolbarProps {
    date: Date,
    onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void,
    locale?: Locale,
    calendarView: CalendarViewType,
    onViewChange: (view: CalendarViewType) => void,
    calendarDateMode: CalendarDateModeType,
    onDateModeChange: (mode: CalendarDateModeType) => void,
}

const CustomToolbar = ({ date, onNavigate, locale, calendarView, onViewChange, calendarDateMode, onDateModeChange }: CustomToolbarProps) => {
    const t = useTranslations('workspaces');

    const dateLabel = calendarView === CalendarViewType.WEEK
        ? format(date, "'W'w · MMM yyyy", { locale })
        : format(date, 'MMMM yyyy', { locale });

    return (
        <div className="flex flex-col gap-y-3 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                {/* Navigation */}
                <div className="flex gap-x-2 items-center">
                    <Button onClick={() => onNavigate('PREV')} size='icon' variant='secondary'>
                        <ChevronLeftIcon className="size-4" />
                    </Button>
                    <div className="flex items-center border border-input rounded-md px-3 py-2 h-8 justify-center min-w-[160px]">
                        <CalendarIcon className="size-4 mr-2" />
                        <p className="text-sm capitalize">{dateLabel}</p>
                    </div>
                    <Button onClick={() => onNavigate('NEXT')} size='icon' variant='secondary'>
                        <ChevronRightIcon className="size-4" />
                    </Button>
                </div>

                {/* Toggles */}
                <div className="flex gap-x-2 items-center flex-wrap gap-y-2">
                    {/* Month / Week toggle */}
                    <div className="flex items-center rounded-md border border-input overflow-hidden h-8">
                        <button
                            onClick={() => onViewChange(CalendarViewType.MONTH)}
                            className={cn(
                                'px-3 text-xs h-full transition-colors',
                                calendarView === CalendarViewType.MONTH
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted text-muted-foreground'
                            )}
                        >
                            {t('calendar-view-month')}
                        </button>
                        <button
                            onClick={() => onViewChange(CalendarViewType.WEEK)}
                            className={cn(
                                'px-3 text-xs h-full transition-colors border-l border-input',
                                calendarView === CalendarViewType.WEEK
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted text-muted-foreground'
                            )}
                        >
                            {t('calendar-view-week')}
                        </button>
                    </div>

                    {/* Due date / Created at toggle */}
                    <div className="flex items-center rounded-md border border-input overflow-hidden h-8">
                        <button
                            onClick={() => onDateModeChange(CalendarDateModeType.CREATED_AT)}
                            className={cn(
                                'px-3 text-xs h-full transition-colors',
                                calendarDateMode === CalendarDateModeType.CREATED_AT
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted text-muted-foreground'
                            )}
                        >
                            {t('calendar-date-created')}
                        </button>
                        <button
                            onClick={() => onDateModeChange(CalendarDateModeType.DUE_DATE)}
                            className={cn(
                                'px-3 text-xs h-full transition-colors border-l border-input',
                                calendarDateMode === CalendarDateModeType.DUE_DATE
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted text-muted-foreground'
                            )}
                        >
                            {t('calendar-date-due')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomToolbar;