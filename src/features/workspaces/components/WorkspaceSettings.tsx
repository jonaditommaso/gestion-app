import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { TASK_STATUS_OPTIONS } from "@/features/tasks/constants/status";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const WorkspaceSettings = () => {
    const t = useTranslations('workspaces');

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
                        <Select defaultValue="BACKLOG">
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TASK_STATUS_OPTIONS.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        <div className="flex items-center gap-x-2">
                                            <div className={cn("size-3 rounded-full", status.color)} />
                                            {t(status.translationKey)}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('auto-archive-completed')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('auto-archive-completed-description')}
                            </p>
                        </div>
                        <Switch />
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
                            {TASK_STATUS_OPTIONS.map((status) => (
                                <div key={status.value} className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className={cn("size-3 rounded-full flex-shrink-0", status.color)} />
                                        <span className="text-sm font-medium">{t(status.translationKey)}</span>
                                    </div>
                                    <div className="w-40">
                                        <Select defaultValue="no">
                                            <SelectTrigger className="h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="no">{t('wip-no')}</SelectItem>
                                                <SelectItem value="flexible">{t('wip-flexible')}</SelectItem>
                                                <SelectItem value="rigid">{t('wip-rigid')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-24">
                                        <Input
                                            type="number"
                                            min="1"
                                            disabled
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
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
                            {TASK_STATUS_OPTIONS.map((status) => (
                                <div key={status.value} className="flex items-center justify-between pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("size-3 rounded-full", status.color)} />
                                        <span className="text-sm font-medium">{t(status.translationKey)}</span>
                                    </div>
                                    <Switch />
                                </div>
                            ))}
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
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{t('due-date')}</span>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{t('description')}</span>
                                <Switch />
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
                        <Switch />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('auto-assign-on-create')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('auto-assign-on-create-description')}
                            </p>
                        </div>
                        <Switch />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('generate-task-code')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('generate-task-code-description')}
                            </p>
                        </div>
                        <Switch defaultChecked />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('date-format')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('date-format-description')}
                            </p>
                        </div>
                        <Select defaultValue="short">
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="short">{t('date-format-short')}</SelectItem>
                                <SelectItem value="long">{t('date-format-long')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card>
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
                        <Switch defaultChecked />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('notify-due-date-reminder')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('notify-due-date-reminder-description')}
                            </p>
                        </div>
                        <Switch defaultChecked />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('notify-task-no-movement')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('notify-task-no-movement-description')}
                            </p>
                        </div>
                        <Switch />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('notify-member-no-tasks')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('notify-member-no-tasks-description')}
                            </p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>

            {/* Permissions Section */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('permissions')}</CardTitle>
                    <CardDescription>
                        {t('permissions-description')}
                    </CardDescription>
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
                        <Switch />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('delete-tasks-permission')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('delete-tasks-permission-description')}
                            </p>
                        </div>
                        <Switch />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('create-columns-permission')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('create-columns-permission-description')}
                            </p>
                        </div>
                        <Switch />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('edit-columns-permission')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('edit-columns-permission-description')}
                            </p>
                        </div>
                        <Switch />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('edit-labels-permission')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('edit-labels-permission-description')}
                            </p>
                        </div>
                        <Switch />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label>{t('invite-members-permission')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('invite-members-permission-description')}
                            </p>
                        </div>
                        <Switch />
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
                        <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                            {t('archive')}
                        </Button>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                            <Label className="text-destructive">{t('delete-workspace')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('delete-workspace-description')}
                            </p>
                        </div>
                        <Button variant="destructive">
                            {t('delete')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default WorkspaceSettings;