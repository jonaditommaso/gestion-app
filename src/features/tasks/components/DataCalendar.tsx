import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { Task } from "../types";
import { es, enUS, it } from "date-fns/locale";
import { addMonths, addWeeks, format, getDay, parse, startOfWeek, subMonths, subWeeks } from "date-fns";
import { useState } from "react";
import { useLocale } from "next-intl";

import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/date-calendar.css'
import EventCard from "./EventCard";
import CustomToolbar from "./CustomToolbar";
import TaskDetailsModal from "./TaskDetailsModal";
import { useWorkspaceConfig } from "@/app/workspaces/hooks/use-workspace-config";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { WorkspaceConfigKey, CalendarViewType, CalendarDateModeType, DEFAULT_WORKSPACE_CONFIG } from "@/app/workspaces/constants/workspace-config-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";

type UpdateWorkspaceResponse = InferResponseType<typeof client.api.workspaces[':workspaceId']['$patch'], 200>
type UpdateWorkspaceRequest = InferRequestType<typeof client.api.workspaces[':workspaceId']['$patch']>

const useSilentUpdateWorkspace = () => {
    const queryClient = useQueryClient();
    return useMutation<UpdateWorkspaceResponse, Error, UpdateWorkspaceRequest>({
        mutationFn: async ({ json, param }) => {
            const response = await client.api.workspaces[':workspaceId']['$patch']({ json, param });
            if (!response.ok) throw new Error('Failed to update workspace');
            return await response.json();
        },
        onSuccess: ({ data }) => {
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
            queryClient.invalidateQueries({ queryKey: ['workspace', data.$id] });
        },
    });
};

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
    const workspaceId = useWorkspaceId();
    const config = useWorkspaceConfig();
    const { data: workspaces } = useGetWorkspaces();
    const { mutate: updateWorkspace } = useSilentUpdateWorkspace();

    const calendarView = config[WorkspaceConfigKey.CALENDAR_VIEW] as CalendarViewType ?? CalendarViewType.MONTH;
    const calendarDateMode = config[WorkspaceConfigKey.CALENDAR_DATE_MODE] as CalendarDateModeType ?? CalendarDateModeType.CREATED_AT;

    const [value, setValue] = useState(new Date());
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const locale = useLocale() as keyof typeof localeMap;
    const dateLocale = localeMap[locale] || enUS;

    const getCustomConfig = () => {
        try {
            const currentWorkspace = workspaces?.documents.find(ws => ws.$id === workspaceId);
            if (currentWorkspace?.metadata) {
                return JSON.parse(currentWorkspace.metadata);
            }
        } catch {
            // ignore
        }
        return {};
    };

    const updateConfig = (key: WorkspaceConfigKey, value: string) => {
        const customConfig = getCustomConfig();
        if (DEFAULT_WORKSPACE_CONFIG[key] === value) {
            delete customConfig[key];
        } else {
            customConfig[key] = value;
        }
        updateWorkspace({
            json: { metadata: JSON.stringify(customConfig) },
            param: { workspaceId },
        });
    };

    const visibleTasks = calendarDateMode === CalendarDateModeType.DUE_DATE
        ? data.filter(task => task.dueDate && !task.archived)
        : data.filter(task => !task.archived);

    const events = visibleTasks.map(task => {
        const date = calendarDateMode === CalendarDateModeType.DUE_DATE
            ? new Date(task.dueDate)
            : new Date(task.$createdAt);
        return {
            start: date,
            end: date,
            title: task.name,
            assignees: task.assignees || [],
            status: task.status,
            id: task.$id,
            featured: task.featured,
            label: task.label,
            type: task.type,
            priority: task.priority,
        };
    });

    const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
        if (action === 'TODAY') {
            setValue(new Date());
        } else if (calendarView === CalendarViewType.WEEK) {
            setValue(prev => action === 'PREV' ? subWeeks(prev, 1) : addWeeks(prev, 1));
        } else {
            setValue(prev => action === 'PREV' ? subMonths(prev, 1) : addMonths(prev, 1));
        }
    };

    const handleViewChange = (view: CalendarViewType) => {
        updateConfig(WorkspaceConfigKey.CALENDAR_VIEW, view);
    };

    const handleDateModeChange = (mode: CalendarDateModeType) => {
        updateConfig(WorkspaceConfigKey.CALENDAR_DATE_MODE, mode);
    };

    return (
        <>
            <Calendar
                localizer={localizer}
                events={events}
                views={['month', 'week']}
                view={calendarView}
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
                            type={event.type}
                            priority={event.priority}
                            onOpenTask={setSelectedTaskId}
                        />
                    ),
                    toolbar: () => (
                        <CustomToolbar
                            date={value}
                            onNavigate={handleNavigate}
                            locale={dateLocale}
                            calendarView={calendarView}
                            onViewChange={handleViewChange}
                            calendarDateMode={calendarDateMode}
                            onDateModeChange={handleDateModeChange}
                        />
                    ),
                }}
            />
            {selectedTaskId && (
                <TaskDetailsModal
                    taskId={selectedTaskId}
                    isOpen={!!selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                />
            )}
        </>
    );
}

export default DataCalendar;