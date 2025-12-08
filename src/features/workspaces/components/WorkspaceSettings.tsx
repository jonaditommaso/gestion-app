import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations, useLocale } from "next-intl";
import { TASK_STATUS_OPTIONS } from "@/features/tasks/constants/status";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import '@github/relative-time-element';
import { Info } from "lucide-react";
import { WorkspaceType } from "../types";
import { useUpdateWorkspace } from "../api/use-update-workspace";
import { useDeleteWorkspace } from "../api/use-delete-workspace";
import { useStatusDisplayName } from "@/app/workspaces/hooks/use-status-display-name";
import { WorkspaceConfigKey, DEFAULT_WORKSPACE_CONFIG, STATUS_TO_LIMIT_KEYS, STATUS_TO_PROTECTED_KEY, STATUS_TO_LABEL_KEY, ColumnLimitType, ShowCardCountType } from "@/app/workspaces/constants/workspace-config-keys";
import { useMemo, useState, useOptimistic } from "react";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";

interface WorkspaceSettingsProps {
    workspace: WorkspaceType;
}

const WorkspaceSettings = ({ workspace }: WorkspaceSettingsProps) => {
    const t = useTranslations('workspaces');
    const locale = useLocale();
    const router = useRouter();
    const { mutate: updateWorkspace, isPending } = useUpdateWorkspace();
    const { mutate: deleteWorkspace, isPending: isDeleting } = useDeleteWorkspace();
    const { getStatusDisplayName } = useStatusDisplayName();

    const [hasUnsavedLimits, setHasUnsavedLimits] = useState(false); // Track if column limits have unsaved changes
    const [pendingConfigKey, setPendingConfigKey] = useState<WorkspaceConfigKey | 'adminMode' | 'columnLimits' | 'archive' | null>(null); // Track which config key is currently being updated

    // Parse current config from metadata
    const currentConfig = useMemo(() => {
        try {
            if (workspace.metadata) {
                const metadata = typeof workspace.metadata === 'string'
                    ? JSON.parse(workspace.metadata)
                    : workspace.metadata;
                return { ...DEFAULT_WORKSPACE_CONFIG, ...metadata };
            }
        } catch (error) {
            console.error('Error parsing metadata:', error);
        }
        return DEFAULT_WORKSPACE_CONFIG;
    }, [workspace.metadata]);

    // Optimistic state for configurations using React's useOptimistic
    const [displayConfig, setOptimisticConfig] = useOptimistic(
        currentConfig,
        (state, updates: Record<string, unknown>) => ({
            ...state,
            ...updates
        })
    );

    // Fecha de ejemplo: 2 días en el futuro
    const exampleDate = new Date();
    exampleDate.setDate(exampleDate.getDate() + 2);

    const [ArchiveDialog, confirmArchive] = useConfirm(
        t('confirm-archive-title'),
        t('confirm-archive-message'),
        'default'
    );

    const [DeleteDialog, confirmDelete] = useConfirm(
        t('confirm-delete-title'),
        t('confirm-delete-message'),
        'destructive'
    );

    const handleArchive = async () => {
        const ok = await confirmArchive();
        if (!ok) return;

        setPendingConfigKey('archive');
        updateWorkspace(
            {
                json: { archived: true },
                param: { workspaceId: workspace.$id }
            },
            {
                onSuccess: () => {
                    router.push('/workspaces');
                },
                onSettled: () => {
                    setPendingConfigKey(null);
                }
            }
        );
    };

    const handleDelete = async () => {
        const ok = await confirmDelete();
        if (!ok) return;

        deleteWorkspace(
            { param: { workspaceId: workspace.$id } },
            {
                onSuccess: () => {
                    router.push('/workspaces');
                }
            }
        );
    };

    // Get only custom config (without defaults)
    const getCustomConfig = () => {
        try {
            if (workspace.metadata) {
                const metadata = typeof workspace.metadata === 'string'
                    ? JSON.parse(workspace.metadata)
                    : workspace.metadata;
                return metadata || {};
            }
        } catch (error) {
            console.error('Error parsing metadata:', error);
        }
        return {};
    };

    // Local state for column limits (type and max value)
    const [columnLimits, setColumnLimits] = useState<Record<string, { type: ColumnLimitType; max: number }>>(() => {
        const limits: Record<string, { type: ColumnLimitType; max: number }> = {};
        TASK_STATUS_OPTIONS.forEach(status => {
            const { type: typeKey, max: maxKey } = STATUS_TO_LIMIT_KEYS[status.value];
            limits[status.value] = {
                type: currentConfig[typeKey] as ColumnLimitType,
                max: currentConfig[maxKey] || 0,
            };
        });
        return limits;
    });

    // Helper to check if a specific config is pending
    const isConfigPending = (key: WorkspaceConfigKey | 'adminMode' | 'columnLimits' | 'archive') => {
        return isPending && pendingConfigKey === key;
    };

    // Check if all permissions are set to admin-only (admin mode)
    const isAdminMode = useMemo(() => {
        return displayConfig[WorkspaceConfigKey.TASK_CREATION_ADMIN_ONLY] &&
               displayConfig[WorkspaceConfigKey.DELETE_TASKS_ADMIN_ONLY] &&
               displayConfig[WorkspaceConfigKey.CREATE_COLUMNS_ADMIN_ONLY] &&
               displayConfig[WorkspaceConfigKey.EDIT_COLUMNS_ADMIN_ONLY] &&
               displayConfig[WorkspaceConfigKey.EDIT_LABELS_ADMIN_ONLY] &&
               displayConfig[WorkspaceConfigKey.INVITE_MEMBERS_ADMIN_ONLY];
    }, [displayConfig]);

    // Helper to update config in metadata (only saves changed values)
    const updateConfig = (key: WorkspaceConfigKey, value: string | number | boolean | null) => {
        const customConfig = getCustomConfig();

        // Optimistic update
        setOptimisticConfig({ [key]: value });

        // Only update if value is different from default
        if (DEFAULT_WORKSPACE_CONFIG[key] === value) {
            // If value equals default, remove it from metadata
            delete customConfig[key];
        } else {
            // Otherwise, set the custom value
            customConfig[key] = value;
        }

        const metadata = JSON.stringify(customConfig);

        setPendingConfigKey(key);
        updateWorkspace(
            {
                json: { metadata },
                param: { workspaceId: workspace.$id }
            },
            {
                onSettled: () => {
                    setPendingConfigKey(null);
                }
            }
        );
    };

    // Save column limits (only saves non-default values)
    const saveColumnLimits = () => {
        const customConfig = getCustomConfig();

        TASK_STATUS_OPTIONS.forEach(status => {
            const { type: typeKey, max: maxKey } = STATUS_TO_LIMIT_KEYS[status.value];
            const limitData = columnLimits[status.value];

            // Only save if different from default
            if (limitData.type !== DEFAULT_WORKSPACE_CONFIG[typeKey]) {
                customConfig[typeKey] = limitData.type;
            } else {
                delete customConfig[typeKey];
            }

            const maxValue = limitData.type === ColumnLimitType.NO ? null : limitData.max;
            if (maxValue !== DEFAULT_WORKSPACE_CONFIG[maxKey]) {
                customConfig[maxKey] = maxValue;
            } else {
                delete customConfig[maxKey];
            }
        });

        const metadata = JSON.stringify(customConfig);

        setPendingConfigKey('columnLimits');
        updateWorkspace(
            {
                json: { metadata },
                param: { workspaceId: workspace.$id }
            },
            {
                onSettled: () => {
                    setPendingConfigKey(null);
                    setHasUnsavedLimits(false);
                }
            }
        );
    };

    // Toggle admin mode - sets all permissions at once
    const toggleAdminMode = (enabled: boolean) => {
        const customConfig = getCustomConfig();

        const permissionKeys = [
            WorkspaceConfigKey.TASK_CREATION_ADMIN_ONLY,
            WorkspaceConfigKey.DELETE_TASKS_ADMIN_ONLY,
            WorkspaceConfigKey.CREATE_COLUMNS_ADMIN_ONLY,
            WorkspaceConfigKey.EDIT_COLUMNS_ADMIN_ONLY,
            WorkspaceConfigKey.EDIT_LABELS_ADMIN_ONLY,
            WorkspaceConfigKey.INVITE_MEMBERS_ADMIN_ONLY,
        ];

        // Optimistic update for all permissions
        const optimisticUpdates: Record<string, boolean> = {};
        permissionKeys.forEach(key => {
            optimisticUpdates[key] = enabled;
        });
        setOptimisticConfig(optimisticUpdates);

        permissionKeys.forEach(key => {
            if (enabled) {
                // Set to true (admin-only)
                if (DEFAULT_WORKSPACE_CONFIG[key] !== true) {
                    customConfig[key] = true;
                } else {
                    delete customConfig[key];
                }
            } else {
                // Set to false (open to all)
                if (DEFAULT_WORKSPACE_CONFIG[key] !== false) {
                    customConfig[key] = false;
                } else {
                    delete customConfig[key];
                }
            }
        });

        const metadata = JSON.stringify(customConfig);

        setPendingConfigKey('adminMode');
        updateWorkspace(
            {
                json: { metadata },
                param: { workspaceId: workspace.$id }
            },
            {
                onSettled: () => {
                    setPendingConfigKey(null);
                }
            }
        );
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 space-y-6 pb-10">
            {/* Workflow Section */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('workflow')}</CardTitle>
                    <CardDescription>
                        {t('workflow-description')}
                    </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="space-y-6 pt-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('default-task-status')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('default-task-status-description')}
                            </p>
                        </div>
                        <Select
                            value={displayConfig[WorkspaceConfigKey.DEFAULT_TASK_STATUS]}
                            onValueChange={(value) => updateConfig(WorkspaceConfigKey.DEFAULT_TASK_STATUS, value)}
                            disabled={isConfigPending(WorkspaceConfigKey.DEFAULT_TASK_STATUS)}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TASK_STATUS_OPTIONS.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        <div className="flex items-center gap-x-2">
                                            <div className={cn("size-3 rounded-full", status.color)} />
                                            {getStatusDisplayName(status.value)}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* //TODO: implement with a cloud function */}
                    {/* <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('auto-archive-completed')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('auto-archive-completed-description')}
                            </p>
                        </div>
                        <Switch
                            checked={currentConfig[WorkspaceConfigKey.AUTO_ARCHIVE_COMPLETED]}
                            onCheckedChange={(checked) => updateConfig(WorkspaceConfigKey.AUTO_ARCHIVE_COMPLETED, checked)}
                            disabled={isPending}
                        />
                    </div> */}

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('show-card-count')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('show-card-count-description')}
                            </p>
                        </div>
                        <Select
                            value={displayConfig[WorkspaceConfigKey.SHOW_CARD_COUNT]}
                            onValueChange={(value) => updateConfig(WorkspaceConfigKey.SHOW_CARD_COUNT, value)}
                            disabled={isConfigPending(WorkspaceConfigKey.SHOW_CARD_COUNT)}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ShowCardCountType.ALWAYS}>{t('show-card-count-always')}</SelectItem>
                                <SelectItem value={ShowCardCountType.FILTERED}>{t('show-card-count-filtered')}</SelectItem>
                                <SelectItem value={ShowCardCountType.NEVER}>{t('show-card-count-never')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {/* //TODO: Add custom threshold option - show count only when cards >= X */}

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('multi-select-labels')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('multi-select-labels-description')}
                            </p>
                        </div>
                        <Switch
                            checked={displayConfig[WorkspaceConfigKey.MULTI_SELECT_LABELS]}
                            onCheckedChange={(checked) => updateConfig(WorkspaceConfigKey.MULTI_SELECT_LABELS, checked)}
                            disabled={isConfigPending(WorkspaceConfigKey.MULTI_SELECT_LABELS)}
                        />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-0.5 flex-1">
                                <Label>{t('column-limits')}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('column-limits-description')}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3 pl-4 border-l-2">
                            {/* Headers */}
                            <div className="flex items-center gap-4 pb-2 border-b">
                                <div className="flex-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase">{t('column')}</span>
                                </div>
                                <div className="w-40 flex items-center gap-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase">{t('limit-type')}</span>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="size-3.5 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-xs">
                                                <div className="space-y-2 text-xs">
                                                    <p><strong>{t('wip-flexible')}:</strong> {t('wip-flexible-tooltip')}</p>
                                                    <p><strong>{t('wip-rigid')}:</strong> {t('wip-rigid-tooltip')}</p>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="w-24">
                                    <span className="text-xs font-medium text-muted-foreground uppercase">{t('max-limit')}</span>
                                </div>
                            </div>
                            {/* Rows */}
                            {TASK_STATUS_OPTIONS.map((status) => {
                                const limitData = columnLimits[status.value];
                                const isMaxDisabled = limitData.type === ColumnLimitType.NO;
                                const labelKey = STATUS_TO_LABEL_KEY[status.value];
                                const customLabel = displayConfig[labelKey];

                                return (
                                    <div key={status.value} className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 flex-1">
                                            <div className={cn("size-3 rounded-full flex-shrink-0", status.color)} />
                                            <span className="text-sm font-medium">{customLabel || t(status.translationKey)}</span>
                                        </div>
                                        <div className="w-40">
                                            <Select
                                                value={limitData.type}
                                                onValueChange={(value: ColumnLimitType) => {
                                                    setColumnLimits(prev => ({
                                                        ...prev,
                                                        [status.value]: {
                                                            type: value,
                                                            max: value === ColumnLimitType.NO ? 0 : prev[status.value].max,
                                                        }
                                                    }));
                                                    setHasUnsavedLimits(true);
                                                }}
                                                disabled={isConfigPending('columnLimits')}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={ColumnLimitType.NO}>{t('wip-no')}</SelectItem>
                                                    <SelectItem value={ColumnLimitType.FLEXIBLE}>{t('wip-flexible')}</SelectItem>
                                                    <SelectItem value={ColumnLimitType.RIGID}>{t('wip-rigid')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-24">
                                            <Input
                                                type="number"
                                                min="1"
                                                disabled={isMaxDisabled || isConfigPending('columnLimits')}
                                                className="h-9"
                                                value={limitData.max || ''}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value) || 0;
                                                    setColumnLimits(prev => ({
                                                        ...prev,
                                                        [status.value]: {
                                                            ...prev[status.value],
                                                            max: value,
                                                        }
                                                    }));
                                                    setHasUnsavedLimits(true);
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {hasUnsavedLimits && (
                            <div className="flex justify-end pt-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={saveColumnLimits}
                                    disabled={isConfigPending('columnLimits')}
                                >
                                    {t('save-changes')}
                                </Button>
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-0.5 flex-1">
                                <Label>{t('protected-columns')}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('protected-columns-description')}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4 pl-4 border-l-2">
                            {TASK_STATUS_OPTIONS.map((status) => {
                                const protectedKey = STATUS_TO_PROTECTED_KEY[status.value];
                                const labelKey = STATUS_TO_LABEL_KEY[status.value];
                                const customLabel = displayConfig[labelKey];
                                return (
                                    <div key={status.value} className="flex items-center justify-between pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("size-3 rounded-full", status.color)} />
                                            <span className="text-sm font-medium">{customLabel || t(status.translationKey)}</span>
                                        </div>
                                        <Switch
                                            checked={displayConfig[protectedKey]}
                                            onCheckedChange={(checked) => updateConfig(protectedKey, checked)}
                                            disabled={isConfigPending(protectedKey)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Task Preferences Section */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('task-preferences')}</CardTitle>
                    <CardDescription>
                        {t('task-preferences-description')}
                    </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-0.5 flex-1">
                                <Label>{t('required-fields-by-default')}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('required-fields-by-default-description')}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3 pl-4 border-l-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{t('assignee')}</span>
                                <Switch
                                    checked={displayConfig[WorkspaceConfigKey.REQUIRED_ASSIGNEE]}
                                    onCheckedChange={(checked) => updateConfig(WorkspaceConfigKey.REQUIRED_ASSIGNEE, checked)}
                                    disabled={isConfigPending(WorkspaceConfigKey.REQUIRED_ASSIGNEE)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{t('due-date')}</span>
                                <Switch
                                    checked={displayConfig[WorkspaceConfigKey.REQUIRED_DUE_DATE]}
                                    onCheckedChange={(checked) => updateConfig(WorkspaceConfigKey.REQUIRED_DUE_DATE, checked)}
                                    disabled={isConfigPending(WorkspaceConfigKey.REQUIRED_DUE_DATE)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{t('description')}</span>
                                <Switch
                                    checked={displayConfig[WorkspaceConfigKey.REQUIRED_DESCRIPTION]}
                                    onCheckedChange={(checked) => updateConfig(WorkspaceConfigKey.REQUIRED_DESCRIPTION, checked)}
                                    disabled={isConfigPending(WorkspaceConfigKey.REQUIRED_DESCRIPTION)}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground pt-2">
                                {t('other-fields-always-required')}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('compact-cards')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('compact-cards-description')}
                            </p>
                        </div>
                        <Switch
                            checked={displayConfig[WorkspaceConfigKey.COMPACT_CARDS]}
                            onCheckedChange={(checked) => updateConfig(WorkspaceConfigKey.COMPACT_CARDS, checked)}
                            disabled={isConfigPending(WorkspaceConfigKey.COMPACT_CARDS)}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('auto-assign-on-create')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('auto-assign-on-create-description')}
                            </p>
                        </div>
                        <Switch
                            checked={currentConfig[WorkspaceConfigKey.AUTO_ASSIGN_ON_CREATE]}
                            onCheckedChange={(checked) => updateConfig(WorkspaceConfigKey.AUTO_ASSIGN_ON_CREATE, checked)}
                            disabled={isPending}
                        />
                    </div>

                    {/* //TODO: implement code generation with cloud function */}
                    {/* <Separator /> */}

                    {/* <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('generate-task-code')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('generate-task-code-description')}
                            </p>
                        </div>
                        <Switch
                            checked={currentConfig[WorkspaceConfigKey.GENERATE_TASK_CODE]}
                            onCheckedChange={(checked) => updateConfig(WorkspaceConfigKey.GENERATE_TASK_CODE, checked)}
                            disabled={isPending}
                        />
                    </div> */}

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('date-format')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('date-format-description')}
                            </p>
                        </div>
                        <Select
                            value={displayConfig[WorkspaceConfigKey.DATE_FORMAT]}
                            onValueChange={(value) => updateConfig(WorkspaceConfigKey.DATE_FORMAT, value)}
                            disabled={isConfigPending(WorkspaceConfigKey.DATE_FORMAT)}
                        >
                            <SelectTrigger className="w-fit">
                                <SelectValue placeholder={t('date-format-long')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="short">
                                    <div className="flex items-center gap-2">
                                        <span>{t('date-format-short-label')}</span>
                                        <span className="text-xs text-muted-foreground">
                                            (ej: <relative-time lang={locale} datetime={exampleDate.toISOString()} />)
                                        </span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="long">{t('date-format-long')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('public-link-expiration')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('public-link-expiration-description')}
                            </p>
                        </div>
                        <Select
                            value={String(displayConfig[WorkspaceConfigKey.PUBLIC_LINK_EXPIRATION_DAYS])}
                            onValueChange={(value) => updateConfig(WorkspaceConfigKey.PUBLIC_LINK_EXPIRATION_DAYS, value === '0' ? 0 : Number(value))}
                            disabled={isConfigPending(WorkspaceConfigKey.PUBLIC_LINK_EXPIRATION_DAYS)}
                        >
                            <SelectTrigger className="w-fit">
                                <SelectValue placeholder={t('expiration-5-days')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">{t('expiration-1-day')}</SelectItem>
                                <SelectItem value="5">{t('expiration-5-days')}</SelectItem>
                                <SelectItem value="10">{t('expiration-10-days')}</SelectItem>
                                <SelectItem value="15">{t('expiration-15-days')}</SelectItem>
                                <SelectItem value="30">{t('expiration-30-days')}</SelectItem>
                                <SelectItem value="0">{t('expiration-unlimited')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications Section */}
            {/* <Card>
                <CardHeader>
                    <CardTitle>{t('notifications')}</CardTitle>
                    <CardDescription>
                        {t('notifications-description')}
                    </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="space-y-6 pt-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('notify-task-assignment')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('notify-task-assignment-description')}
                            </p>
                        </div>
                        <Switch
                            checked={currentConfig[WorkspaceConfigKey.NOTIFY_TASK_ASSIGNMENT]}
                            onCheckedChange={(checked) => updateConfig(WorkspaceConfigKey.NOTIFY_TASK_ASSIGNMENT, checked)}
                            disabled={isPending}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('notify-due-date-reminder')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('notify-due-date-reminder-description')}
                            </p>
                        </div>
                        <Switch
                            checked={currentConfig[WorkspaceConfigKey.NOTIFY_DUE_DATE_REMINDER]}
                            onCheckedChange={(checked) => updateConfig(WorkspaceConfigKey.NOTIFY_DUE_DATE_REMINDER, checked)}
                            disabled={isPending}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('notify-task-no-movement')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('notify-task-no-movement-description')}
                            </p>
                        </div>
                        <Switch
                            checked={currentConfig[WorkspaceConfigKey.NOTIFY_TASK_NO_MOVEMENT]}
                            onCheckedChange={(checked) => updateConfig(WorkspaceConfigKey.NOTIFY_TASK_NO_MOVEMENT, checked)}
                            disabled={isPending}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('notify-member-no-tasks')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('notify-member-no-tasks-description')}
                            </p>
                        </div>
                        <Switch
                            checked={currentConfig[WorkspaceConfigKey.NOTIFY_MEMBER_NO_TASKS]}
                            onCheckedChange={(checked) => updateConfig(WorkspaceConfigKey.NOTIFY_MEMBER_NO_TASKS, checked)}
                            disabled={isPending}
                        />
                    </div>
                </CardContent>
            </Card> */}

            {/* Permissions Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1.5">
                            <CardTitle>{t('permissions')}</CardTitle>
                            <CardDescription>
                                {t('permissions-description')}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="admin-mode" className="text-sm font-medium cursor-pointer">
                                {t('admin-mode')}
                            </Label>
                            <Switch
                                id="admin-mode"
                                checked={isAdminMode}
                                onCheckedChange={toggleAdminMode}
                                disabled={isConfigPending('adminMode')}
                            />
                        </div>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="space-y-6 pt-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('task-creation-permission')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('task-creation-permission-description')}
                            </p>
                        </div>
                        <Switch
                            checked={displayConfig[WorkspaceConfigKey.TASK_CREATION_ADMIN_ONLY]}
                            onCheckedChange={(checked) => updateConfig(WorkspaceConfigKey.TASK_CREATION_ADMIN_ONLY, checked)}
                            disabled={isConfigPending(WorkspaceConfigKey.TASK_CREATION_ADMIN_ONLY) || isAdminMode}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('delete-tasks-permission')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('delete-tasks-permission-description')}
                            </p>
                        </div>
                        <Switch
                            checked={displayConfig[WorkspaceConfigKey.DELETE_TASKS_ADMIN_ONLY]}
                            onCheckedChange={(checked) => updateConfig(WorkspaceConfigKey.DELETE_TASKS_ADMIN_ONLY, checked)}
                            disabled={isConfigPending(WorkspaceConfigKey.DELETE_TASKS_ADMIN_ONLY) || isAdminMode}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('create-columns-permission')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('create-columns-permission-description')}
                            </p>
                        </div>
                        <Switch
                            checked={currentConfig[WorkspaceConfigKey.CREATE_COLUMNS_ADMIN_ONLY]}
                            onCheckedChange={(checked) => updateConfig(WorkspaceConfigKey.CREATE_COLUMNS_ADMIN_ONLY, checked)}
                            disabled={isPending || isAdminMode}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('edit-columns-permission')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('edit-columns-permission-description')}
                            </p>
                        </div>
                        <Switch
                            checked={displayConfig[WorkspaceConfigKey.EDIT_COLUMNS_ADMIN_ONLY]}
                            onCheckedChange={(checked) => updateConfig(WorkspaceConfigKey.EDIT_COLUMNS_ADMIN_ONLY, checked)}
                            disabled={isConfigPending(WorkspaceConfigKey.EDIT_COLUMNS_ADMIN_ONLY) || isAdminMode}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('edit-labels-permission')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('edit-labels-permission-description')}
                            </p>
                        </div>
                        <Switch
                            checked={displayConfig[WorkspaceConfigKey.EDIT_LABELS_ADMIN_ONLY]}
                            onCheckedChange={(checked) => updateConfig(WorkspaceConfigKey.EDIT_LABELS_ADMIN_ONLY, checked)}
                            disabled={isConfigPending(WorkspaceConfigKey.EDIT_LABELS_ADMIN_ONLY) || isAdminMode}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('invite-members-permission')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('invite-members-permission-description')}
                            </p>
                        </div>
                        <Switch
                            checked={displayConfig[WorkspaceConfigKey.INVITE_MEMBERS_ADMIN_ONLY]}
                            onCheckedChange={(checked) => updateConfig(WorkspaceConfigKey.INVITE_MEMBERS_ADMIN_ONLY, checked)}
                            disabled={isConfigPending(WorkspaceConfigKey.INVITE_MEMBERS_ADMIN_ONLY) || isAdminMode}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">{t('danger-zone')}</CardTitle>
                    <CardDescription>
                        {t('danger-zone-description')}
                    </CardDescription>
                </CardHeader>
                <Separator className="bg-destructive" />
                <CardContent className="space-y-6 pt-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label className="text-destructive">{t('archive-workspace')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('archive-workspace-description')}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={handleArchive}
                            disabled={isConfigPending('archive')}
                        >
                            {t('archive')}
                        </Button>
                    </div>

                    <Separator />

                    {/* //TODO: Add mfa to delete workspace */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label className="text-destructive">{t('delete-workspace')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('delete-workspace-description')}
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {t('delete')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <ArchiveDialog />
            <DeleteDialog />
        </div>
    );
}

export default WorkspaceSettings;