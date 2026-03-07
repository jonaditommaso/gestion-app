'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetRecentActivity } from "@/features/home/api/use-get-recent-activity";
import { useTranslations } from "next-intl";
import { Activity, TrendingUp, Trophy, MessageSquare, CheckSquare } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const TASK_ACTION_KEYS: Record<string, string> = {
    TASK_STATUS_UPDATED: 'activity-task-status',
    TASK_NAME_UPDATED: 'activity-task-renamed',
    DESCRIPTION_UPDATED: 'activity-task-description',
    COMMENT_UPDATED: 'activity-task-comment',
    PRIORITY_UPDATED: 'activity-task-priority',
    DUE_DATE_UPDATED: 'activity-task-duedate',
    ASSIGNEES_UPDATED: 'activity-task-assignees',
    CHECKLIST_UPDATED: 'activity-task-checklist',
    TASK_FEATURED_UPDATED: 'activity-task-featured',
    TASK_SHARED: 'activity-task-shared',
    TASK_TYPE_UPDATED: 'activity-task-type',
};

type ActivityItemProps = {
    type: string;
    actorName: string | null;
    action: string;
    title: string;
    amount?: number;
    currency?: string;
    timestamp: string;
};

const ActivityItemRow = ({ type, actorName, action, title, amount, currency, timestamp }: ActivityItemProps) => {
    const t = useTranslations('home');
    const actor = actorName ?? t('activity-unknown-actor');

    let icon = <Activity className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />;
    let description = '';

    if (type === 'deal_won') {
        icon = <Trophy className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />;
        description = t('activity-deal-won', { title });
    } else if (type === 'deal_created') {
        icon = <TrendingUp className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />;
        const amountStr = amount && currency
            ? ` ${new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)}`
            : '';
        description = t('activity-deal-created', { title: `${title}${amountStr}` });
    } else if (type === 'deal_activity') {
        icon = <MessageSquare className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />;
        description = t('activity-deal-comment', { actor, title });
    } else if (type === 'task_activity') {
        icon = <CheckSquare className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />;
        const actionKey = TASK_ACTION_KEYS[action];
        description = actionKey
            ? t(actionKey as Parameters<typeof t>[0], { actor, title })
            : t('activity-task-generic', { actor, title });
    }

    return (
        <div className="flex items-start gap-2 py-1.5">
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-xs leading-tight truncate">{description}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{dayjs(timestamp).fromNow()}</p>
            </div>
        </div>
    );
};

const RecentActivityWidget = () => {
    const t = useTranslations('home');
    const { data, isLoading } = useGetRecentActivity();

    if (isLoading) {
        return (
            <Card className="col-span-1">
                <CardHeader>
                    <Skeleton className="h-5 w-36" />
                </CardHeader>
                <CardContent className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <Skeleton className="h-3.5 w-3.5 rounded mt-0.5" />
                            <div className="flex-1 space-y-1">
                                <Skeleton className="h-3.5 w-full" />
                                <Skeleton className="h-2.5 w-16" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    const items = data ?? [];

    return (
        <Card className="col-span-1">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                    {t('recent-activity-title')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-1">{t('recent-activity-empty')}</p>
                ) : (
                    <div className="divide-y divide-border/50">
                        {items.map((item) => (
                            <ActivityItemRow
                                key={item.id}
                                type={item.type}
                                actorName={item.actorName}
                                action={item.action}
                                title={item.title}
                                amount={item.amount}
                                currency={item.currency}
                                timestamp={item.timestamp}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default RecentActivityWidget;
