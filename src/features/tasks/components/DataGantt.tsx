'use client'

import { useMemo, useState } from "react";
import {
    addDays,
    addMonths,
    addWeeks,
    differenceInCalendarDays,
    endOfDay,
    endOfMonth,
    endOfWeek,
    endOfYear,
    format,
    isSameDay,
    isValid,
    startOfDay,
    startOfMonth,
    startOfWeek,
    startOfYear,
    subDays,
} from "date-fns";
import { enUS, es, it } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import TaskDetailsModal from "./TaskDetailsModal";
import { Task, TaskStatus } from "../types";
import { Button } from "@/components/ui/button";

interface DataGanttProps {
    data: Task[];
}

type GanttItem = {
    task: Task;
    start: Date;
    end: Date;
    durationDays: number;
};

type TimelineData = {
    axisStart: Date;
    axisEnd: Date;
    totalDays: number;
    ticks: Date[];
    tickFormat: string;
    labelEvery: number;
};

type GanttScale = 'week' | 'month' | 'year';

const DATE_LOCALES = { es, en: enUS, it };

const STATUS_BAR_CLASS: Record<TaskStatus, string> = {
    [TaskStatus.BACKLOG]: "bg-pink-500",
    [TaskStatus.TODO]: "bg-red-500",
    [TaskStatus.IN_PROGRESS]: "bg-yellow-500 text-black",
    [TaskStatus.IN_REVIEW]: "bg-blue-500",
    [TaskStatus.DONE]: "bg-emerald-500",
    [TaskStatus.CUSTOM]: "bg-slate-500",
};

const DataGantt = ({ data }: DataGanttProps) => {
    const t = useTranslations('workspaces');
    const locale = useLocale() as 'es' | 'en' | 'it';
    const dateLocale = DATE_LOCALES[locale] ?? enUS;
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [scale, setScale] = useState<GanttScale>('month');

    const items = useMemo<GanttItem[]>(() => {
        const withRange = data.reduce<GanttItem[]>((acc, task) => {
            if (task.archived || !task.dueDate) return acc;

            const start = new Date(task.$createdAt);
            const due = new Date(task.dueDate);

            if (!isValid(start) || !isValid(due)) return acc;

            const end = due < start ? start : due;
            const durationDays = Math.max(1, differenceInCalendarDays(end, start) + 1);

            acc.push({ task, start, end, durationDays });
            return acc;
        }, []);

        return withRange.sort((a, b) => a.start.getTime() - b.start.getTime());
    }, [data]);

    const timeline = useMemo<TimelineData | null>(() => {
        if (items.length === 0) return null;

        const earliest = items[0].start;
        const latest = items.reduce((maxDate, item) => item.end > maxDate ? item.end : maxDate, items[0].end);

        let axisStart: Date;
        let axisEnd: Date;
        let tickFormat = 'MMM d';

        if (scale === 'week') {
            axisStart = startOfWeek(subDays(earliest, 3), { weekStartsOn: 1 });
            axisEnd = endOfWeek(addDays(latest, 3), { weekStartsOn: 1 });
            tickFormat = 'MMM d';
        } else if (scale === 'month') {
            axisStart = startOfMonth(subDays(earliest, 7));
            axisEnd = endOfMonth(addDays(latest, 7));
            tickFormat = 'MMM d';
        } else {
            axisStart = startOfYear(subDays(earliest, 30));
            axisEnd = endOfYear(addDays(latest, 30));
            tickFormat = 'MMM yyyy';
        }

        axisStart = startOfDay(axisStart);
        axisEnd = endOfDay(axisEnd);
        const totalDays = Math.max(1, differenceInCalendarDays(axisEnd, axisStart) + 1);

        const ticks: Date[] = [];
        let cursor = axisStart;
        let guard = 0;

        while (cursor <= axisEnd && guard < 240) {
            ticks.push(cursor);

            if (scale === 'week') {
                cursor = totalDays > 56 ? addWeeks(cursor, 1) : addDays(cursor, 1);
            } else if (scale === 'month') {
                cursor = totalDays > 370 ? addMonths(cursor, 2) : addWeeks(cursor, 1);
            } else {
                cursor = addMonths(cursor, 1);
            }

            guard += 1;
        }

        if (!isSameDay(ticks[ticks.length - 1], axisEnd)) {
            ticks.push(axisEnd);
        }

        const labelEvery =
            scale === 'week'
                ? (ticks.length > 18 ? 2 : 1)
                : (ticks.length > 14 ? 2 : 1);

        return { axisStart, axisEnd, totalDays, ticks, tickFormat, labelEvery };
    }, [items, scale]);

    if (!timeline) {
        return (
            <div className="h-full min-h-[360px] rounded-lg border bg-background p-4 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <CalendarDays className="size-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium">{t('gantt-empty')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('gantt-empty-description')}</p>
                </div>
            </div>
        );
    }

    const getLeftPercent = (date: Date): number => {
        const offset = differenceInCalendarDays(date, timeline.axisStart);
        return (offset / timeline.totalDays) * 100;
    };

    const getWidthPercent = (start: Date, end: Date): number => {
        const durationDays = Math.max(1, differenceInCalendarDays(end, start) + 1);
        return (durationDays / timeline.totalDays) * 100;
    };

    return (
        <>
            <div className="h-full rounded-lg border bg-background p-4">
                <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-xs text-muted-foreground">
                        {format(timeline.axisStart, 'PPP', { locale: dateLocale })} - {format(timeline.axisEnd, 'PPP', { locale: dateLocale })}
                    </p>
                    <div className="inline-flex rounded-md border p-0.5 bg-muted/40">
                        <Button
                            type="button"
                            size="sm"
                            variant={scale === 'week' ? 'secondary' : 'ghost'}
                            className="h-7"
                            onClick={() => setScale('week')}
                        >
                            {t('calendar-view-week')}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={scale === 'month' ? 'secondary' : 'ghost'}
                            className="h-7"
                            onClick={() => setScale('month')}
                        >
                            {t('calendar-view-month')}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={scale === 'year' ? 'secondary' : 'ghost'}
                            className="h-7"
                            onClick={() => setScale('year')}
                        >
                            {t('calendar-view-year')}
                        </Button>
                    </div>
                </div>

                <div className="overflow-auto">
                    <div className="min-w-[880px]">
                        <div className="grid grid-cols-[280px_minmax(560px,1fr)] gap-3 px-2 pb-2">
                            <div className="text-xs font-medium text-muted-foreground">{t('task-name')}</div>
                            <div className="relative h-7">
                                {timeline.ticks.map((tick, index) => {
                                    const left = getLeftPercent(tick);
                                    const showLabel = index % timeline.labelEvery === 0 || index === timeline.ticks.length - 1;
                                    return (
                                        <div
                                            key={tick.toISOString()}
                                            className="absolute top-0 -translate-x-1/2 text-[11px] text-muted-foreground"
                                            style={{ left: `${left}%` }}
                                        >
                                            {showLabel ? format(tick, timeline.tickFormat, { locale: dateLocale }) : ''}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-2 pb-1">
                            {items.map((item) => {
                                const left = getLeftPercent(item.start);
                                const rawWidth = getWidthPercent(item.start, item.end);
                                const width = Math.min(Math.max(rawWidth, 0.8), 100 - left);

                                return (
                                    <div key={item.task.$id} className="grid grid-cols-[280px_minmax(560px,1fr)] gap-3 items-center px-2">
                                        <button
                                            type="button"
                                            className="text-left rounded-md px-2 py-1.5 hover:bg-muted/60 transition-colors"
                                            onClick={() => setSelectedTaskId(item.task.$id)}
                                        >
                                            <p className="text-sm font-medium truncate">{item.task.name}</p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {format(item.start, 'PPP', { locale: dateLocale })} - {format(item.end, 'PPP', { locale: dateLocale })}
                                            </p>
                                        </button>

                                        <div className="relative h-9 rounded-md border bg-muted/20 overflow-hidden">
                                            {timeline.ticks.map((tick) => {
                                                const tickLeft = getLeftPercent(tick);
                                                return (
                                                    <div
                                                        key={`line-${tick.toISOString()}`}
                                                        className="absolute top-0 bottom-0 border-l border-border/60"
                                                        style={{ left: `${tickLeft}%` }}
                                                    />
                                                );
                                            })}

                                            <button
                                                type="button"
                                                onClick={() => setSelectedTaskId(item.task.$id)}
                                                className={cn(
                                                    "absolute top-1/2 -translate-y-1/2 h-5 rounded-md px-2 text-[11px] font-medium text-white truncate",
                                                    STATUS_BAR_CLASS[item.task.status]
                                                )}
                                                style={{
                                                    left: `${left}%`,
                                                    width: `${width}%`,
                                                }}
                                                title={item.task.name}
                                            >
                                                {format(item.end, 'MMM d', { locale: dateLocale })}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {selectedTaskId && (
                <TaskDetailsModal
                    taskId={selectedTaskId}
                    isOpen={!!selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                />
            )}
        </>
    );
};

export default DataGantt;