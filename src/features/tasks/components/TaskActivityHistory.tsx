'use client';

import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { es, enUS, it } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import { useGetTaskActivityLogs } from "../api/activity-logs";
import {
    ActivityAction,
    TaskActivityLog,
    StatusUpdatedPayload,
    DescriptionUpdatedPayload,
    CommentUpdatedPayload,
    LabelUpdatedPayload,
    PriorityUpdatedPayload,
    DueDateUpdatedPayload,
    ChecklistUpdatedPayload,
    AssigneesUpdatedPayload,
    TaskTypeUpdatedPayload,
    TaskNameUpdatedPayload,
    TaskSharedPayload,
    TaskFeaturedUpdatedPayload,
} from "../types/activity-log";
import {
    MessageSquare,
    Tag,
    Calendar,
    Flag,
    Users,
    FileText,
    CheckSquare,
    ArrowRight,
    Share2,
    Star,
    Type,
    Edit3,
    Workflow,
} from "lucide-react";
import { format } from "date-fns";

const DATE_LOCALES = { es, en: enUS, it };

interface TaskActivityHistoryProps {
    taskId: string;
}

/**
 * Parse a JSON string payload into a typed object
 */
const parsePayload = <T,>(payloadStr: string): T | null => {
    try {
        return JSON.parse(payloadStr) as T;
    } catch {
        return null;
    }
};

/**
 * Get the icon for an activity action
 */
const getActionIcon = (action: ActivityAction) => {
    switch (action) {
        case ActivityAction.TASK_STATUS_UPDATED:
            return Workflow;
        case ActivityAction.DESCRIPTION_UPDATED:
            return FileText;
        case ActivityAction.COMMENT_UPDATED:
            return MessageSquare;
        case ActivityAction.LABEL_UPDATED:
            return Tag;
        case ActivityAction.PRIORITY_UPDATED:
            return Flag;
        case ActivityAction.DUE_DATE_UPDATED:
            return Calendar;
        case ActivityAction.CHECKLIST_UPDATED:
            return CheckSquare;
        case ActivityAction.ASSIGNEES_UPDATED:
            return Users;
        case ActivityAction.TASK_TYPE_UPDATED:
            return Type;
        case ActivityAction.TASK_NAME_UPDATED:
            return Edit3;
        case ActivityAction.TASK_SHARED:
            return Share2;
        case ActivityAction.TASK_FEATURED_UPDATED:
            return Star;
        default:
            return FileText;
    }
};

/**
 * Component for rendering individual activity log entries
 */
const ActivityLogEntry = ({
    log,
    locale
}: {
    log: TaskActivityLog;
    locale: 'es' | 'en' | 'it';
}) => {
    const t = useTranslations('workspaces');
    const Icon = getActionIcon(log.action);
    const dateLocale = DATE_LOCALES[locale] || DATE_LOCALES.en;

    const formatLocalizedDate = (date: string) => {
        const dateFormats: Record<string, string> = {
            es: "d 'de' MMMM 'de' yyyy",
            en: "MMMM d, yyyy",
            it: "d MMMM yyyy"
        };
        return format(new Date(date), dateFormats[locale] || dateFormats.en, { locale: dateLocale });
    };

    const renderActivityText = () => {
        switch (log.action) {
            case ActivityAction.TASK_STATUS_UPDATED: {
                const payload = parsePayload<StatusUpdatedPayload>(log.payload);
                if (!payload) return t('activity.changed-status');
                return (
                    <span>
                        {t('activity.changed-status-from')}{' '}
                        <strong>{payload.fromCustomId || t(`status-${payload.from.toLowerCase()}`)}</strong>
                        <ArrowRight className="inline size-3 mx-1" />
                        <strong>{payload.toCustomId || t(`status-${payload.to.toLowerCase()}`)}</strong>
                    </span>
                );
            }

            case ActivityAction.DESCRIPTION_UPDATED: {
                const payload = parsePayload<DescriptionUpdatedPayload>(log.payload);
                if (!payload) return t('activity.updated-description');
                return payload.subAction === 'set'
                    ? t('activity.updated-description')
                    : t('activity.cleared-description');
            }

            case ActivityAction.COMMENT_UPDATED: {
                const payload = parsePayload<CommentUpdatedPayload>(log.payload);
                if (!payload) return t('activity.comment');
                switch (payload.subAction) {
                    case 'created':
                        return t('activity.added-comment');
                    case 'edited':
                        return t('activity.edited-comment');
                    case 'deleted':
                        return t('activity.deleted-comment');
                    default:
                        return t('activity.comment');
                }
            }

            case ActivityAction.LABEL_UPDATED: {
                const payload = parsePayload<LabelUpdatedPayload>(log.payload);
                if (!payload) return t('activity.changed-label');
                if (!payload.from && payload.to) {
                    return (
                        <span>
                            {t('activity.set-label')} <strong>{payload.to}</strong>
                        </span>
                    );
                }
                if (payload.from && !payload.to) {
                    return t('activity.removed-label');
                }
                return (
                    <span>
                        {t('activity.changed-label-from')}{' '}
                        <strong>{payload.from}</strong>
                        <ArrowRight className="inline size-3 mx-1" />
                        <strong>{payload.to}</strong>
                    </span>
                );
            }

            case ActivityAction.PRIORITY_UPDATED: {
                const payload = parsePayload<PriorityUpdatedPayload>(log.payload);
                if (!payload) return t('activity.changed-priority');
                const priorityKeys = ['', 'priority-very-low', 'priority-low', 'priority-medium', 'priority-high', 'priority-very-high'];
                return (
                    <span>
                        {t('activity.changed-priority-from')}{' '}
                        <strong>{t(priorityKeys[payload.from] || 'priority-medium')}</strong>
                        <ArrowRight className="inline size-3 mx-1" />
                        <strong>{t(priorityKeys[payload.to] || 'priority-medium')}</strong>
                    </span>
                );
            }

            case ActivityAction.DUE_DATE_UPDATED: {
                const payload = parsePayload<DueDateUpdatedPayload>(log.payload);
                if (!payload) return t('activity.changed-due-date');
                if (!payload.from && payload.to) {
                    return (
                        <span>
                            {t('activity.set-due-date')}{' '}
                            <strong>{formatLocalizedDate(payload.to)}</strong>
                        </span>
                    );
                }
                if (payload.from && !payload.to) {
                    return t('activity.removed-due-date');
                }
                return (
                    <span>
                        {t('activity.changed-due-date-from')}{' '}
                        <strong>{formatLocalizedDate(payload.from!)}</strong>
                        <ArrowRight className="inline size-3 mx-1" />
                        <strong>{formatLocalizedDate(payload.to!)}</strong>
                    </span>
                );
            }

            case ActivityAction.CHECKLIST_UPDATED: {
                const payload = parsePayload<ChecklistUpdatedPayload>(log.payload);
                if (!payload) return t('activity.updated-checklist');
                switch (payload.subAction) {
                    case 'item_added':
                        return (
                            <span>
                                {t('activity.added-checklist-item')}{' '}
                                {payload.itemTitle && <strong>&quot;{payload.itemTitle}&quot;</strong>}
                            </span>
                        );
                    case 'item_removed':
                        return (
                            <span>
                                {t('activity.removed-checklist-item')}{' '}
                                {payload.itemTitle && <strong>&quot;{payload.itemTitle}&quot;</strong>}
                            </span>
                        );
                    case 'item_completed':
                        return (
                            <span>
                                {t('activity.completed-checklist-item')}{' '}
                                {payload.itemTitle && <strong>&quot;{payload.itemTitle}&quot;</strong>}
                            </span>
                        );
                    case 'item_uncompleted':
                        return (
                            <span>
                                {t('activity.uncompleted-checklist-item')}{' '}
                                {payload.itemTitle && <strong>&quot;{payload.itemTitle}&quot;</strong>}
                            </span>
                        );
                    case 'title_changed':
                        return t('activity.changed-checklist-title');
                    case 'checklist_deleted':
                        return (
                            <span>
                                {t('activity.deleted-checklist')}{' '}
                                {payload.checklistTitle && <strong>&quot;{payload.checklistTitle}&quot;</strong>}
                            </span>
                        );
                    default:
                        return t('activity.updated-checklist');
                }
            }

            case ActivityAction.ASSIGNEES_UPDATED: {
                const payload = parsePayload<AssigneesUpdatedPayload>(log.payload);
                if (!payload) return t('activity.changed-assignees');
                return payload.subAction === 'added'
                    ? (
                        <span>
                            {t('activity.assigned')} <strong>{payload.memberName}</strong>
                        </span>
                    )
                    : (
                        <span>
                            {t('activity.unassigned')} <strong>{payload.memberName}</strong>
                        </span>
                    );
            }

            case ActivityAction.TASK_TYPE_UPDATED: {
                const payload = parsePayload<TaskTypeUpdatedPayload>(log.payload);
                if (!payload) return t('activity.changed-type');
                return (
                    <span>
                        {t('activity.changed-type-from')}{' '}
                        <strong>{t(`task-type-${payload.from}`)}</strong>
                        <ArrowRight className="inline size-3 mx-1" />
                        <strong>{t(`task-type-${payload.to}`)}</strong>
                    </span>
                );
            }

            case ActivityAction.TASK_NAME_UPDATED: {
                const payload = parsePayload<TaskNameUpdatedPayload>(log.payload);
                if (!payload) return t('activity.renamed-task');
                return (
                    <span>
                        {t('activity.renamed-task-from')}{' '}
                        <strong>&quot;{payload.from}&quot;</strong>
                        <ArrowRight className="inline size-3 mx-1" />
                        <strong>&quot;{payload.to}&quot;</strong>
                    </span>
                );
            }

            case ActivityAction.TASK_SHARED: {
                const payload = parsePayload<TaskSharedPayload>(log.payload);
                if (!payload) return t('activity.shared-task');
                if (payload.recipientCount && payload.recipientCount > 1) {
                    return (
                        <span>
                            {t('activity.shared-task-multiple', { count: payload.recipientCount })}
                        </span>
                    );
                }
                return payload.sharedToName
                    ? (
                        <span>
                            {t('activity.shared-task-with')} <strong>{payload.sharedToName}</strong>
                        </span>
                    )
                    : t('activity.shared-task');
            }

            case ActivityAction.TASK_FEATURED_UPDATED: {
                const payload = parsePayload<TaskFeaturedUpdatedPayload>(log.payload);
                if (!payload) return t('activity.changed-featured');
                return payload.to
                    ? t('activity.marked-featured')
                    : t('activity.unmarked-featured');
            }

            default:
                return t('activity.updated-task');
        }
    };

    return (
        <div className="flex gap-x-3 py-3">
            <div className="relative">
                <MemberAvatar
                    name={log.actor?.name || 'User'}
                    memberId={log.actorMemberId}
                    className="size-8 flex-shrink-0"
                />
                <div className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5">
                    <Icon className="size-3 text-muted-foreground" />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-sm">
                        <span className="font-medium">{log.actor?.name || 'Unknown'}</span>
                        {' '}
                        <span className="text-muted-foreground">
                            {renderActivityText()}
                        </span>
                    </p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(log.$createdAt), {
                        addSuffix: true,
                        locale: DATE_LOCALES[locale] || DATE_LOCALES.en
                    })}
                </p>
            </div>
        </div>
    );
};

export const TaskActivityHistory = ({ taskId }: TaskActivityHistoryProps) => {
    const t = useTranslations('workspaces');
    const locale = useLocale() as 'es' | 'en' | 'it';
    const { data, isLoading } = useGetTaskActivityLogs({ taskId });

    const logs = (data?.documents || []) as TaskActivityLog[];

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-x-3 py-3">
                        <Skeleton className="size-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <p className="text-muted-foreground text-sm p-3 text-center">
                {t('no-activity-history')}
            </p>
        );
    }

    return (
        <div className="divide-y max-h-80 overflow-y-auto">
            {logs.map((log) => (
                <ActivityLogEntry key={log.$id} log={log} locale={locale} />
            ))}
        </div>
    );
};
