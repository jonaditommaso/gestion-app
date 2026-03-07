'use client'
import { useGetOperations } from "@/features/billing-management/api/use-get-operations";
import { useGetOrgTasksSummary } from "@/features/tasks/api/use-get-org-tasks-summary";
import { useGetTeamContext } from "@/features/team/api/use-get-team-context";
import { useTranslations } from "next-intl";
import { AlertCircle, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import dayjs from "dayjs";

type BillingOperation = {
    status?: 'PENDING' | 'PAID' | 'OVERDUE';
    dueDate?: string | null;
};

const CriticalAlertsBar = () => {
    const t = useTranslations('home');
    const { data: teamContext } = useGetTeamContext();
    const { data: operationsData } = useGetOperations();
    const { data: tasksSummary } = useGetOrgTasksSummary();

    const organizationRole = teamContext?.membership?.role;
    const isPrivileged = organizationRole === 'OWNER' || organizationRole === 'ADMIN';

    const overdueInvoiceCount = useMemo(() => {
        if (!isPrivileged || !operationsData?.documents) return 0;

        const todayStart = dayjs().startOf('day');

        return (operationsData.documents as unknown as BillingOperation[])
            .filter((op) =>
                op.status === 'PENDING' &&
                op.dueDate != null &&
                dayjs(op.dueDate).isBefore(todayStart)
            ).length;
    }, [isPrivileged, operationsData]);

    const overdueWorkspaces = tasksSummary?.overdueByWorkspace ?? [];
    const unassignedFeaturedWorkspaces = tasksSummary?.unassignedFeaturedByWorkspace ?? [];

    if (!isPrivileged) return null;

    const hasAlerts =
        overdueInvoiceCount > 0 ||
        overdueWorkspaces.length > 0 ||
        unassignedFeaturedWorkspaces.length > 0;

    if (!hasAlerts) return null;

    return (
        <div className="mb-4 mr-4 flex gap-2 items-center flex-wrap">
            {overdueInvoiceCount > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30 px-4 py-2.5 flex-1">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm font-medium">
                            {t('alerts-overdue-invoices', { count: overdueInvoiceCount })}
                        </span>
                    </div>
                    <Link
                        href="/billing-management"
                        className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline"
                    >
                        {t('alerts-view')}
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
            )}

            {overdueWorkspaces.map((ws) => (
                <div key={`overdue-${ws.workspaceId}`} className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30 px-4 py-2.5 flex-1">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm font-medium">
                            {t('alerts-overdue-tasks-ws', { count: ws.count, workspace: ws.workspaceName })}
                        </span>
                    </div>
                    <Link
                        href={`/workspaces/${ws.workspaceId}`}
                        className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline"
                    >
                        {t('alerts-view')}
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
            ))}

            {unassignedFeaturedWorkspaces.map((ws) => (
                <div key={`featured-${ws.workspaceId}`} className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 px-4 py-2.5 flex-1">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm font-medium">
                            {t('alerts-unassigned-featured-ws', { count: ws.count, workspace: ws.workspaceName })}
                        </span>
                    </div>
                    <Link
                        href={`/workspaces/${ws.workspaceId}`}
                        className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                    >
                        {t('alerts-view')}
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default CriticalAlertsBar;
