'use client'
import { CalendarDemo } from "./Calendar";
import MyNotes from "./notes/MyNotes";
import TasksWidget from "./TasksWidget";
import SendMessageButton from "./messages/SendMessageButton";
import { MessagesContainer } from "./messages/MessagesContainer";
import ShortcutButton from "./shortcut/ShortcutButton";
import CreateMeetButton from "./meets/CreateMeetButton";
import CalendarEvents from "./CalendarEvents";
import { HomeCustomizationProvider, PersonalizeHomeButton, useHomeCustomization } from "./customization";
import { useGetMessages } from "../api/use-get-messages";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { TaskStatus } from "@/features/tasks/types";
import { useGetMember } from "@/features/members/api/use-get-member";
import { WidgetId } from "./customization/types";
import { MinusCircle } from "lucide-react";

interface EditableWidgetOverlayProps {
    onRemove: () => void;
    children: React.ReactNode;
}

const EditableWidgetOverlay = ({ onRemove, children }: EditableWidgetOverlayProps) => {
    return (
        <div className="relative">
            <button
                onClick={onRemove}
                className="absolute -top-2 -right-2 z-50 bg-destructive text-destructive-foreground rounded-full p-1 shadow-lg hover:bg-destructive/90 transition-colors"
                title="Ocultar widget"
            >
                <MinusCircle className="h-5 w-5" />
            </button>
            <div className="ring-2 ring-dashed ring-muted-foreground/30 rounded-lg">
                {children}
            </div>
        </div>
    );
};

interface ConditionalWidgetProps {
    widgetId: WidgetId;
    children: React.ReactNode;
    hasData?: boolean;
}

const ConditionalWidget = ({ widgetId, children, hasData = true }: ConditionalWidgetProps) => {
    const { isWidgetVisible, config, isEditMode, toggleWidgetVisibility, canToggleWidget } = useHomeCustomization();
    const canToggle = canToggleWidget(widgetId);

    if (!isWidgetVisible(widgetId)) {
        return null;
    }

    // In edit mode with toggleable widget, show remove overlay
    if (isEditMode && canToggle) {
        return (
            <EditableWidgetOverlay onRemove={() => toggleWidgetVisibility(widgetId)}>
                {children}
            </EditableWidgetOverlay>
        );
    }

    // Smart widgets logic: hide if no data (only when not in edit mode)
    if (!isEditMode && config.smartWidgets && !hasData) {
        return null;
    }

    return <>{children}</>;
};

const HomeWidgetsGrid = () => {
    const { data: messages } = useGetMessages();
    const { data: member } = useGetMember();
    const { config } = useHomeCustomization();

    // Obtener el status configurado para el widget de tareas
    const selectedStatusId = config.taskWidgetStatusId || TaskStatus.TODO;
    const isCustomStatus = selectedStatusId.startsWith('CUSTOM_');

    const { data: tasks } = useGetTasks({
        workspaceId: member?.workspaceId,
        status: isCustomStatus ? TaskStatus.CUSTOM : selectedStatusId as TaskStatus,
        statusCustomId: isCustomStatus ? selectedStatusId : null,
        limit: 2,
        enabled: !!member?.workspaceId
    });

    const hasMessages = (messages?.total ?? 0) > 0;
    const hasTasks = (tasks?.documents?.length ?? 0) > 0;

    return (
        <div className="gap-4 grid grid-cols-3">
            <ConditionalWidget widgetId="my-notes">
                <MyNotes />
            </ConditionalWidget>

            <ConditionalWidget widgetId="messages" hasData={hasMessages}>
                <MessagesContainer />
            </ConditionalWidget>

            <div className="flex col-span-1 gap-2">
                <div className="col-span-1 w-56 flex flex-col gap-5 justify-between">
                    <ConditionalWidget widgetId="send-message">
                        <SendMessageButton />
                    </ConditionalWidget>
                    <ConditionalWidget widgetId="shortcut">
                        <ShortcutButton />
                    </ConditionalWidget>
                    <ConditionalWidget widgetId="create-meet">
                        <CreateMeetButton />
                    </ConditionalWidget>
                </div>
                <ConditionalWidget widgetId="calendar">
                    <CalendarDemo />
                </ConditionalWidget>
            </div>

            <ConditionalWidget widgetId="todo-tasks" hasData={hasTasks}>
                <TasksWidget />
            </ConditionalWidget>

            <ConditionalWidget widgetId="calendar-events">
                <CalendarEvents />
            </ConditionalWidget>
        </div>
    );
};

const HomeHeader = () => {
    return (
        <div className="flex justify-end mb-4 mr-4">
            <PersonalizeHomeButton />
        </div>
    );
};

const HomeWidgets = () => {
    return (
        <HomeCustomizationProvider>
            <HomeHeader />
            <HomeWidgetsGrid />
        </HomeCustomizationProvider>
    );
};

export default HomeWidgets;
