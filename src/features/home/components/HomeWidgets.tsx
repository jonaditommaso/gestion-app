'use client'
import { CalendarDemo } from "./Calendar";
import MyNotes from "./notes/MyNotes";
import TasksWidget from "./TasksWidget";
import SendMessageButton from "./messages/SendMessageButton";
import { MessagesContainer } from "./messages/MessagesContainer";
import ShortcutButton from "./shortcut/ShortcutButton";
import CreateMeetButton from "./meets/CreateMeetButton";
import CalendarEvents from "./CalendarEvents";
import BillingSnapshotWidget from "./BillingSnapshotWidget";
import WorkspaceHealthWidget from "./WorkspaceHealthWidget";
import TeamVelocityWidget from "./TeamVelocityWidget";
import PipelineHealthWidget from "./PipelineHealthWidget";
import RecentActivityWidget from "./RecentActivityWidget";
import UpcomingPaymentsWidget from "./UpcomingPaymentsWidget";
import CreateDealButton from "./CreateDealButton";
import CreateTaskButton from "./CreateTaskButton";
import CreateBillingButton from "./CreateBillingButton";
import CriticalAlertsBar from "./CriticalAlertsBar";
import { HomeCustomizationProvider, PersonalizeHomeButton, useHomeCustomization } from "./customization";
import { useGetMessages } from "../api/use-get-messages";
import { useGetMeets } from "../api/use-get-meets";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { TaskStatus } from "@/features/tasks/types";
import { useGetMember } from "@/features/members/api/use-get-member";
import { WidgetId, FREE_PLAN_WIDGETS } from "./customization/types";
import { useAppContext } from "@/context/AppContext";
import { useGetOrgDashboard } from "@/features/tasks/api/use-get-org-dashboard";
import { useGetOperations } from "@/features/billing-management/api/use-get-operations";
import { Message } from "./messages/types";
import { MinusCircle } from "lucide-react";
import { usePlanAccess } from "@/hooks/usePlanAccess";

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
    const { isFree } = usePlanAccess();
    const canToggle = canToggleWidget(widgetId);

    if (isFree && !FREE_PLAN_WIDGETS.includes(widgetId)) {
        return null;
    }

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
    const { isFree } = usePlanAccess();
    const { data: messages } = useGetMessages({ enabled: !isFree });
    const { data: member } = useGetMember();
    const { teamContext } = useAppContext();
    const { config } = useHomeCustomization();

    const organizationRole = teamContext?.membership?.role;
    const isPrivileged = organizationRole === 'OWNER' || organizationRole === 'ADMIN';
    const canCreate = organizationRole !== 'VIEWER';

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

    const hasUnreadMessages = (messages?.documents ?? []).some(
        (m): m is Message => 'read' in m && !m.read
    );
    const hasTasks = (tasks?.documents?.length ?? 0) > 0;

    const { data: meets } = useGetMeets({ enabled: !isFree });
    const hasMeets = (meets?.length ?? 0) > 0;

    const { data: orgDashboard } = useGetOrgDashboard();
    const hasVelocityData = (orgDashboard?.workspaceVelocity?.length ?? 0) > 0;

    const { data: operationsData } = useGetOperations({ enabled: isPrivileged });
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const hasUpcomingPayments = (operationsData?.documents ?? []).some((op) => {
        const o = op as { type?: string; status?: string; dueDate?: string | null };
        return o.type === 'income' && o.status === 'PENDING' && o.dueDate != null && new Date(o.dueDate) >= todayStart;
    });

    return (
        <div className="gap-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 pb-4">
            <ConditionalWidget widgetId="my-notes">
                <MyNotes />
            </ConditionalWidget>

            <ConditionalWidget widgetId="messages" hasData={hasUnreadMessages}>
                <MessagesContainer />
            </ConditionalWidget>

            <div className="flex flex-wrap col-span-1 gap-2 justify-around">
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
                <div className="col-span-1 w-56 flex flex-col gap-5 justify-between">
                    {canCreate && (
                        <>
                            <ConditionalWidget widgetId="new-task">
                                <CreateTaskButton />
                            </ConditionalWidget>
                            <ConditionalWidget widgetId="new-deal">
                                <CreateDealButton />
                            </ConditionalWidget>
                            <ConditionalWidget widgetId="new-billing">
                                <CreateBillingButton />
                            </ConditionalWidget>
                        </>
                    )}
                </div>
                <ConditionalWidget widgetId="calendar">
                    <CalendarDemo />
                </ConditionalWidget>
            </div>

            <ConditionalWidget widgetId="todo-tasks" hasData={hasTasks}>
                <TasksWidget />
            </ConditionalWidget>

            <ConditionalWidget widgetId="calendar-events" hasData={hasMeets}>
                <CalendarEvents />
            </ConditionalWidget>

            {isPrivileged && (
                <ConditionalWidget widgetId="billing-snapshot">
                    <BillingSnapshotWidget />
                </ConditionalWidget>
            )}

            {isPrivileged && (
                <ConditionalWidget widgetId="workspace-health">
                    <WorkspaceHealthWidget />
                </ConditionalWidget>
            )}

            {isPrivileged && (
                <ConditionalWidget widgetId="team-velocity" hasData={hasVelocityData}>
                    <TeamVelocityWidget />
                </ConditionalWidget>
            )}

            {isPrivileged && (
                <ConditionalWidget widgetId="pipeline-health">
                    <PipelineHealthWidget />
                </ConditionalWidget>
            )}

            {isPrivileged && (
                <ConditionalWidget widgetId="recent-activity">
                    <RecentActivityWidget />
                </ConditionalWidget>
            )}

            {isPrivileged && (
                <ConditionalWidget widgetId="upcoming-payments" hasData={hasUpcomingPayments}>
                    <UpcomingPaymentsWidget />
                </ConditionalWidget>
            )}
        </div>
    );
};

const HomeHeader = () => {
    const { isEditMode } = useHomeCustomization();

    return (
        <div className={`flex justify-end mr-4 ${isEditMode ? 'mb-4' : ''}`}>
            <PersonalizeHomeButton />
        </div>
    );
};

const HomeWidgets = () => {
    return (
        <HomeCustomizationProvider>
            <HomeHeader />
            <CriticalAlertsBar />
            <HomeWidgetsGrid />
        </HomeCustomizationProvider>
    );
};

export default HomeWidgets;
