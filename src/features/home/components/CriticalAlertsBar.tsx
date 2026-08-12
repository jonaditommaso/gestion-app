'use client'
import { useGetOperations } from "@/features/billing-management/api/use-get-operations";
import { useGetOrgTasksSummary } from "@/features/tasks/api/use-get-org-tasks-summary";
import { useAppContext } from "@/context/AppContext";
import { useTranslations } from "next-intl";
import { AlertCircle, AlertTriangle, ArrowRight, FileExclamationPoint  } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import dayjs from "dayjs";
import { usePlanAccess } from "@/hooks/usePlanAccess";

type BillingOperation = {
    status?: 'PENDING' | 'PAID' | 'OVERDUE';
    dueDate?: string | null;
};

const getAlertStyles = (count: number) => {
    const isSevere = count > 2;

    return {
        container: isSevere
            ? 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30'
            : 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30',
        icon: isSevere
            ? 'text-rose-600 dark:text-rose-400'
            : 'text-amber-600 dark:text-amber-400',
        text: isSevere
            ? 'text-rose-600 dark:text-rose-400'
            : 'text-amber-600 dark:text-amber-400',
    };
};

const CriticalAlertsBar = () => {
    const t = useTranslations('home');
    const { teamContext } = useAppContext();
    const { isFree } = usePlanAccess();

    const organizationRole = teamContext?.membership?.role;
    const isPrivileged = organizationRole === 'OWNER' || organizationRole === 'ADMIN';
    const shouldFetch = !isFree && isPrivileged;

    const { data: operationsData } = useGetOperations({ enabled: shouldFetch });
    const { data: tasksSummary } = useGetOrgTasksSummary({ enabled: shouldFetch });

    const overdueInvoiceCount = useMemo(() => {
        if (!shouldFetch || !operationsData?.documents) return 0;

        const todayStart = dayjs().startOf('day');

        return (operationsData.documents as unknown as BillingOperation[])
            .filter((op) =>
                op.status === 'PENDING' &&
                op.dueDate != null &&
                dayjs(op.dueDate).isBefore(todayStart)
            ).length;
    }, [shouldFetch, operationsData]);

    if (isFree) return null;
    if (!isPrivileged) return null;

    const overdueWorkspaces = tasksSummary?.overdueByWorkspace ?? [];
    const unassignedFeaturedWorkspaces = tasksSummary?.unassignedFeaturedByWorkspace ?? [];

    const hasAlerts =
        overdueInvoiceCount > 0 ||
        overdueWorkspaces.length > 0 ||
        unassignedFeaturedWorkspaces.length > 0;

    if (!hasAlerts) return null;

    return (
        <div className="mb-4 mr-4 flex gap-2 items-center flex-wrap">
            {overdueInvoiceCount > 0 && (
                <Link
                    href="/billing-management"
                    className={`flex cursor-pointer flex-row gap-2 rounded-lg border px-4 py-2.5 flex-1 ${getAlertStyles(overdueInvoiceCount).container}`}
                >
                    <AlertCircle className={`h-8 w-8 flex-shrink-0 stroke-1 ${getAlertStyles(overdueInvoiceCount).icon}`} />
                    <div className="flex flex-col gap-1 text-left">
                        <div className={`flex items-center gap-2 ${getAlertStyles(overdueInvoiceCount).text}`}>
                            <span className="text-sm font-medium">
                                {t('alerts-overdue-invoices', { count: overdueInvoiceCount })}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs hover:underline">
                            {t('alerts-view')}
                            <ArrowRight className="h-3 w-3" />
                        </div>
                    </div>
                </Link>
            )}

            {overdueWorkspaces.map((ws) => {
                const alertStyles = getAlertStyles(ws.count);

                return (
                    <Link
                        key={`overdue-${ws.workspaceId}`}
                        href={`/workspaces/${ws.workspaceId}`}
                        className={`flex cursor-pointer flex-row gap-2 rounded-lg border px-4 py-2.5 flex-1 ${alertStyles.container}`}
                    >
                        <FileExclamationPoint className={`h-8 w-8 flex-shrink-0 stroke-1 ${alertStyles.icon}`} />
                        <div className="flex flex-col gap-1 text-left">
                            <div className={`flex items-center gap-2 ${alertStyles.text}`}>
                            <span className="text-sm font-medium">
                                {t('alerts-overdue-tasks-ws', { count: ws.count, workspace: ws.workspaceName })}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs hover:underline">
                            {t('alerts-view')}
                            <ArrowRight className="h-3 w-3" />
                        </div>
                    </div>
                </Link>
                );
            })}

            {unassignedFeaturedWorkspaces.map((ws) => {
                const alertStyles = getAlertStyles(ws.count);

                return (
                    <Link
                        key={`featured-${ws.workspaceId}`}
                        href={`/workspaces/${ws.workspaceId}`}
                        className={`flex cursor-pointer flex-row gap-2 rounded-lg border px-4 py-2.5 flex-1 ${alertStyles.container}`}
                    >
                        <AlertTriangle className={`h-8 w-8 flex-shrink-0 stroke-1 ${alertStyles.icon}`} />
                        <div className="flex flex-col gap-1 text-left">
                            <div className={`flex items-center gap-2 ${alertStyles.text}`}>
                            <span className="text-sm font-medium">
                                {t('alerts-unassigned-featured-ws', { count: ws.count, workspace: ws.workspaceName })}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs hover:underline">
                            {t('alerts-view')}
                            <ArrowRight className="h-3 w-3" />
                        </div>
                    </div>
                </Link>
                );
            })}
        </div>
    );
};

export default CriticalAlertsBar;
