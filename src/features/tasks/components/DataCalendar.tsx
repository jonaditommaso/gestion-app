import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { Task } from "../types";
import { es, enUS, it } from "date-fns/locale";
import { addMonths, format, getDay, parse, startOfWeek, subMonths } from "date-fns";
import { useState } from "react";
import { useLocale } from "next-intl";

import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/date-calendar.css'
import EventCard from "./EventCard";
import CustomToolbar from "./CustomToolbar";

interface DataCalendarProps {
    data: Task[]
}

const localeMap = {
    es: es,
    en: enUS,
    it: it
};

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

const DataCalendar = ({ data }: DataCalendarProps) => {
    const [value, setValue] = useState(data.length > 0 ? new Date(data[0].dueDate) : new Date())
    const locale = useLocale() as keyof typeof localeMap;
    const dateLocale = localeMap[locale] || enUS;

    const events = data.map(task => ({
        start: new Date(task.dueDate),
        end: new Date(task.dueDate),
        title: task.name,
        assignees: task.assignees || [],
        status: task.status,
        id: task.$id,
        featured: task.featured,
        label: task.label,
    }))

    const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
        if (action === 'PREV') {
            setValue(subMonths(value, 1))
        } else if (action === 'NEXT') {
            setValue(addMonths(value, 1))
        } else if (action === 'TODAY') {
            setValue(new Date())
        }
    }

    return (
        <Calendar
            localizer={localizer}
            events={events}
            views={['month']}
            defaultView="month"
            date={value}
            toolbar
            showAllEvents
            className="h-full bg-background p-4 rounded-lg"
            culture={locale}
            max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
            formats={{
                weekdayFormat: (date, culture, localizer) => localizer?.format(date, 'EEEE', culture) ?? '',
            }}
            components={{
                eventWrapper: ({ event }) => (
                    <EventCard
                        title={event.title}
                        assignees={event.assignees}
                        status={event.status}
                        id={event.id}
                        featured={event.featured}
                        label={event.label}
                    />
                ),
                toolbar: () => <CustomToolbar date={value} onNavigate={handleNavigate} locale={dateLocale} />
            }}
        />
    );
}

export default DataCalendar;