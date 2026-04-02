'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetOrgDashboard } from "@/features/tasks/api/use-get-org-dashboard";
import { useTranslations } from "next-intl";
import { CheckCircle2, TrendingUp } from "lucide-react";
import Link from "next/link";

const TeamVelocityWidget = () => {
    const t = useTranslations('home');
    const { data, isLoading } = useGetOrgDashboard();

    if (isLoading) {
        return (
            <Card className="col-span-1">
                <CardHeader>
                    <Skeleton className="h-5 w-36" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-2/3" />
                </CardContent>
            </Card>
        );
    }

    const velocity = data?.workspaceVelocity ?? [];
    const total = velocity.reduce((acc, ws) => acc + ws.completedLastWeek, 0);

    return (
        <Card className="col-span-1">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                    {t('team-velocity-title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
                {velocity.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-1">{t('team-velocity-empty')}</p>
                ) : (
                    <>
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 pb-2">
                            <TrendingUp className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm font-medium">
                                {t('team-velocity-total', { count: total })}
                            </span>
                        </div>
                        {velocity.map((ws) => (
                            <Link
                                key={ws.workspaceId}
                                href={`/workspaces/${ws.workspaceId}`}
                                className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                                    <span className="text-xs font-medium truncate">{ws.workspaceName}</span>
                                </div>
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex-shrink-0">
                                    {t('team-velocity-tasks', { count: ws.completedLastWeek })}
                                </span>
                            </Link>
                        ))}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default TeamVelocityWidget;
