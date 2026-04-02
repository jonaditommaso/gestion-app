'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetOrgDashboard } from "@/features/tasks/api/use-get-org-dashboard";
import { useTranslations } from "next-intl";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const WorkspaceHealthWidget = () => {
    const t = useTranslations('home');
    const { data, isLoading } = useGetOrgDashboard();

    if (isLoading) {
        return (
            <Card className="col-span-1">
                <CardHeader>
                    <Skeleton className="h-5 w-36" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-7 w-full" />
                    <Skeleton className="h-7 w-full" />
                    <Skeleton className="h-7 w-3/4" />
                </CardContent>
            </Card>
        );
    }

    const workspaceHealth = data?.workspaceHealth ?? [];

    return (
        <Card className="col-span-1">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span>{t('workspace-health-title')}</span>
                    <Link
                        href="/workspaces"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                        {t('workspace-health-view-all')}
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
                {workspaceHealth.length === 0 ? (
                    <div className="flex items-center gap-2 text-muted-foreground py-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs">{t('workspace-health-healthy')}</span>
                    </div>
                ) : (
                    workspaceHealth.map((ws) => (
                        <Link
                            key={ws.workspaceId}
                            href={`/workspaces/${ws.workspaceId}`}
                            className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                {ws.overdueCount > 0 ? (
                                    <AlertCircle className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                                ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                                )}
                                <span className="text-xs font-medium truncate">{ws.workspaceName}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs text-muted-foreground">
                                    {t('workspace-health-active', { count: ws.totalActive })}
                                </span>
                                {ws.overdueCount > 0 && (
                                    <span className="text-xs text-rose-500 font-semibold">
                                        {t('workspace-health-overdue', { count: ws.overdueCount })}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))
                )}
            </CardContent>
        </Card>
    );
};

export default WorkspaceHealthWidget;
