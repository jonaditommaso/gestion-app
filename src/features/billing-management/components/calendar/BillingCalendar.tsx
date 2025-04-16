'use client'
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { enUS, es, it } from "date-fns/locale";
import { addMonths, format, getDay, parse, startOfWeek, subMonths } from "date-fns";
import { useState } from "react";

import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/features/tasks/components/date-calendar.css'
import CustomToolbar from "@/features/tasks/components/CustomToolbar";
import EventCard from "./EventCard";
import { useGetOperations } from "../../api/use-get-operations";
import FadeLoader from "react-spinners/FadeLoader";

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

const BillingCalendar = () => {
    const { data, isLoading } = useGetOperations();
    const operations = data?.documents || [];

    const [value, setValue] = useState(operations.length > 0 ? new Date(operations[0].date) : new Date())

    const events = operations.length > 0 ? operations.map((operation) => ({
        start: new Date(operation.date),
        end: new Date(operation.date),
        category: operation.category,
        //id: operation.$id,
        import: operation.import,
        type: operation.type
    })) : []

    console.log(operations)

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
            formats={{
                weekdayFormat: (date, culture, localizer) => localizer?.format(date, 'EEEE', culture) ?? '',
            }}
            components={{
                eventWrapper: ({ event }) => (
                    <EventCard
                        category={event.category}
                        importValue={event.import}
                        type={event.type}
                    />
                ),
                toolbar: () => <CustomToolbar date={value} onNavigate={handleNavigate} />
            }}
        />
    );
}

export default BillingCalendar;