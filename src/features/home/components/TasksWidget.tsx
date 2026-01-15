'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useTranslations } from "next-intl";
import { TaskStatus } from '../../tasks/types';
import { useGetMember } from "@/features/members/api/use-get-member";
import { useLocale } from "next-intl";
import { useCustomStatuses } from "@/app/workspaces/hooks/use-custom-statuses";
import { useHomeCustomization } from "./customization";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";

const TasksWidget = () => {
    const { data: member } = useGetMember();
    const { config, setTaskWidgetStatus } = useHomeCustomization();
    const { allStatuses, getIconComponent } = useCustomStatuses();
    const t = useTranslations('home');
    const tWorkspaces = useTranslations('workspaces');
    const locale = useLocale();

    // Obtener el status ID configurado o usar TODO por defecto
    const selectedStatusId = config.taskWidgetStatusId || TaskStatus.TODO;

    // Encontrar el status en allStatuses para obtener info (label, color, icon)
    const statusInfo = allStatuses.find(s => s.id === selectedStatusId);

    // Determinar si es un custom status
    const isCustomStatus = selectedStatusId.startsWith('CUSTOM_');

    // Configurar los parámetros de la query
    const queryParams = {
        workspaceId: member?.workspaceId,
        status: isCustomStatus ? TaskStatus.CUSTOM : selectedStatusId as TaskStatus,
        statusCustomId: isCustomStatus ? selectedStatusId : null,
        limit: 2,
        enabled: !!member?.workspaceId
    };

    const { data: tasks, isLoading: isLoadingTasks } = useGetTasks(queryParams);

    // Obtener el icono del status
    const StatusIcon = statusInfo ? getIconComponent(statusInfo.icon) : null;

    // Color del status (para el texto del título y borde de las tareas)
    const statusColor = statusInfo?.color || '#ef4444'; // Red por defecto (TODO)

    // Traducir el label del status si tiene translationKey
    const getStatusLabel = (status: typeof allStatuses[0]) => {
        return status.translationKey
            ? tWorkspaces(status.translationKey)
            : status.label;
    };

    const statusLabel = statusInfo ? getStatusLabel(statusInfo) : 'To Do';

    return (
        <Card className="col-span-1 max-h-[355px]">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {StatusIcon && (
                        <StatusIcon
                            className="h-5 w-5 flex-shrink-0"
                            style={{ color: statusColor }}
                        />
                    )}
                    <Select
                        value={selectedStatusId}
                        onValueChange={setTaskWidgetStatus}
                    >
                        <SelectTrigger className="w-auto h-auto p-0 border-0 bg-transparent focus:ring-0 focus:ring-offset-0 shadow-none font-semibold text-base [&>svg]:hidden">
                            <span className="flex items-center gap-1">
                                {t('tasks-from')}{' '}
                                <span
                                    style={{ color: statusColor }}
                                    className="hover:underline hover:decoration-dashed hover:underline-offset-4 cursor-pointer"
                                >
                                    {statusLabel}
                                </span>
                            </span>
                        </SelectTrigger>
                        <SelectContent>
                            {allStatuses.map(status => {
                                const Icon = getIconComponent(status.icon);
                                return (
                                    <SelectItem
                                        key={status.id}
                                        value={status.id}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Icon
                                                className="h-4 w-4"
                                                style={{ color: status.color }}
                                            />
                                            <span style={{ color: status.color }}>
                                                {getStatusLabel(status)}
                                            </span>
                                        </span>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </CardTitle>
                <CardDescription>{t('from-workspace')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {isLoadingTasks
                    ? (
                        Array.from({ length: 2 }, (_, index) => (
                            <Skeleton key={index} className="p-2 rounded-md h-12" />
                        ))
                    ) : tasks?.documents && tasks.documents.length > 0 ? (
                        tasks.documents.map(task => (
                            <div
                                className="border bg-sidebar-accent p-2 rounded-md border-l-4"
                                style={{ borderLeftColor: statusColor }}
                                key={task.$id}
                            >
                                <p className="font-medium">{task.name}</p>
                                {task.dueDate && (
                                    <p className="text-sm text-muted-foreground">
                                        {t('limit-date')}:{' '}
                                        <relative-time lang={locale} datetime={task.dueDate}></relative-time>
                                    </p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            {t('no-tasks')}
                        </p>
                    )
                }
            </CardContent>
        </Card>
    );
}

export default TasksWidget;
