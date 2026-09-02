'use client'
import { useEffect, useMemo, useState } from "react";
import { BillingTable } from "../details/BillingTable";
import DetailsInfoCards from "../details/DetailsInfoCards";
import AllCategoriesTable from "../categories/AllCategoriesTable";
import BillingCalendar from "../calendar/BillingCalendar";
import { useTranslations } from "next-intl";
import FollowUpPanel from "../followup/FollowUpPanel";
import MonthlyComparison from "../details/MonthlyComparison";
import DraftsTable from "../drafts/DraftsTable";
import ArchivedTable from "../archived/ArchivedTable";
import { useGetOperations } from "../../api/use-get-operations";
import dayjs from "dayjs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Archive, BellRing, CalendarDays, FileEdit, LayoutDashboard, Plus, Table2, Tags, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddOperationModal from "../AddOperationModal";
import { useCurrentUserPermissions } from "@/features/roles/hooks/useCurrentUserPermissions";
import { PERMISSIONS } from "@/features/roles/constants";
import { DialogContainer } from "@/components/DialogContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import BillingOverviewCharts from "./BillingOverviewCharts";
import { useSearchParams } from "next/navigation";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import BillingAnalyticsWorkspace from "@/features/billing-management/components/dashboard/BillingAnalyticsWorkspace";

const dashboardViews = [
    {
        id: 'dashboard',
        icon: LayoutDashboard,
        labelKey: 'dashboard',
    },
    {
        id: 'operations',
        icon: Table2,
        labelKey: 'operations',
    },
    {
        id: 'analytics',
        icon: BarChart3,
        labelKey: 'analytics',
    },
] as const;

const operationTabs = [
    {
        id: 'table',
        icon: Table2,
        labelKey: 'operations-table',
    },
    {
        id: 'calendar',
        icon: CalendarDays,
        labelKey: 'operations-calendar',
    },
    {
        id: 'drafts',
        icon: FileEdit,
        labelKey: 'operations-drafts',
    },
    {
        id: 'archived',
        icon: Archive,
        labelKey: 'operations-archived',
    },
] as const;

type DashboardView = (typeof dashboardViews)[number]['id'];
type OperationsTab = (typeof operationTabs)[number]['id'];

interface DashboardOperation {
    status?: 'PENDING' | 'PAID' | 'OVERDUE';
    dueDate?: string | Date;
}

const BillingDashboard = () => {
    const searchParams = useSearchParams();

    const getSafeDashboardView = (value: string | null): DashboardView => {
        if (value === 'dashboard' || value === 'operations' || value === 'analytics') {
            return value;
        }

        return 'dashboard';
    };

    const getSafeOperationTab = (value: string | null): OperationsTab => {
        if (value === 'table' || value === 'calendar' || value === 'drafts' || value === 'archived') {
            return value;
        }

        return 'table';
    };

    const [currentView, setCurrentView] = useState<DashboardView>(() => getSafeDashboardView(searchParams.get('view')));
    const [currentOperationsTab, setCurrentOperationsTab] = useState<OperationsTab>(() => getSafeOperationTab(searchParams.get('tab')));
    const [isAddOperationOpen, setIsAddOperationOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const { hasPermission } = useCurrentUserPermissions();
    const { data: operationsData } = useGetOperations();
    const t = useTranslations('billing');
    const canWrite = hasPermission(PERMISSIONS.WRITE);

    const operations = useMemo(() => (operationsData?.documents || []) as unknown as DashboardOperation[], [operationsData]);

    const dueSoonCount = useMemo(() => {
        const todayStart = dayjs().startOf('day');
        const dueSoonEnd = dayjs().add(3, 'day').endOf('day');

        return operations.filter((operation) => {
            if ((operation.status || 'PENDING') !== 'PENDING' || !operation.dueDate) return false;
            const dueDate = dayjs(operation.dueDate);

            return (dueDate.isAfter(todayStart) || dueDate.isSame(todayStart, 'day'))
                && (dueDate.isBefore(dueSoonEnd) || dueDate.isSame(dueSoonEnd, 'day'));
        }).length;
    }, [operations]);

    useEffect(() => {
        const viewFromParams = getSafeDashboardView(searchParams.get('view'));
        const tabFromParams = getSafeOperationTab(searchParams.get('tab'));

        setCurrentView(viewFromParams);
        setCurrentOperationsTab(tabFromParams);
    }, [searchParams]);

    return (
        <div className="w-full px-4 pb-6 md:px-6">
            <AddOperationModal
                isOpen={isAddOperationOpen}
                setIsOpen={setIsAddOperationOpen}
            />

            <DialogContainer
                title={t('categories')}
                isOpen={isCategoriesOpen}
                setIsOpen={setIsCategoriesOpen}
                contentClassName="w-[95vw] max-w-[1100px] max-h-[88vh]"
                bodyClassName="max-h-[70vh] overflow-auto pr-1"
            >
                <AllCategoriesTable />
            </DialogContainer>

            <div className="mx-auto w-full max-w-[1600px] gap-4">
                <div className="sticky top-[4px] z-30 pt-24 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-muted/60 bg-background/95 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
                    <div className="flex items-start gap-2">
                        {dashboardViews.map((view) => {
                            const Icon = view.icon;
                            const isActive = view.id === currentView;

                            return (
                                <Button
                                    key={view.id}
                                    variant="ghost"
                                    className={cn(
                                        "h-11 min-w-[150px] flex-1 justify-start gap-2 rounded-xl border border-border/70 px-3 text-sm shadow-sm",
                                        isActive
                                            ? "border-sky-600 bg-sky-600 !text-white hover:bg-sky-600/90"
                                            : "bg-background text-muted-foreground hover:bg-muted"
                                    )}
                                    onClick={() => setCurrentView(view.id)}
                                >
                                    <Icon className="size-4" />
                                    <span>{t(view.labelKey)}</span>
                                </Button>
                            );
                        })}
                    </div>

                    {canWrite && (
                        <Button
                            className="h-11 shrink-0 justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-900"
                            onClick={() => setIsAddOperationOpen(true)}
                        >
                            <Plus className="size-4" />
                            <span>{t('add-operation')}</span>
                        </Button>
                    )}
                </div>

                {/* <Separator className="mb-3" /> */}

                <div className="space-y-4 mt-3">
                    {currentView === 'dashboard' && (
                        <div className="mx-auto w-full space-y-4">
                            <DetailsInfoCards />
                            {dueSoonCount > 0 && (
                                <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                                    <BellRing className="h-4 w-4" />
                                    <AlertTitle>{t('due-reminder-title')}</AlertTitle>
                                    <AlertDescription>{t('due-reminder-description', { count: dueSoonCount })}</AlertDescription>
                                </Alert>
                            )}
                            <FollowUpPanel />
                            <BillingOverviewCharts />
                            <MonthlyComparison />
                        </div>
                    )}

                    {currentView === 'operations' && (
                        <div className="mx-auto w-full">
                            <Tabs
                                value={currentOperationsTab}
                                onValueChange={(value) => setCurrentOperationsTab(value as OperationsTab)}
                                className="rounded-2xl border border-border/80 bg-card p-3 shadow-sm md:p-4"
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <TabsList className="h-auto w-full flex-wrap justify-start bg-transparent p-0 md:w-auto">
                                        {operationTabs.map((tab) => {
                                            const Icon = tab.icon;

                                            return (
                                                <TabsTrigger key={tab.id} value={tab.id} className="h-9 gap-2 rounded-lg bg-background">
                                                    <Icon className="size-4" />
                                                    <span>{t(tab.labelKey)}</span>
                                                </TabsTrigger>
                                            );
                                        })}
                                    </TabsList>

                                    {canWrite && (
                                        <Button variant="outline" className="w-full gap-2 md:w-auto" onClick={() => setIsCategoriesOpen(true)}>
                                            <Tags className="size-4" />
                                            {t('manage-categories')}
                                        </Button>
                                    )}
                                </div>
                                <Separator className="my-4" />

                                <TabsContent value="table" className="mt-0">
                                    <BillingTable />
                                </TabsContent>

                                <TabsContent value="calendar" className="mt-0">
                                    <BillingCalendar />
                                </TabsContent>

                                <TabsContent value="drafts" className="mt-0">
                                    <DraftsTable />
                                </TabsContent>

                                <TabsContent value="archived" className="mt-0">
                                    <ArchivedTable />
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}

                    {currentView === 'analytics' && (
                        <div className="mx-auto w-full space-y-4">
                            <BillingAnalyticsWorkspace />
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
}

export default BillingDashboard;