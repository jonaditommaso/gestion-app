'use client'
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListChecksIcon, UserIcon, SignalIcon } from "lucide-react";
import { TaskStatus } from "../types";
import { useTaskFilters } from "../hooks/use-task-filters";
import CustomDatePicker from "@/components/CustomDatePicker";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import { useTranslations } from "next-intl";
import { TASK_PRIORITY_OPTIONS } from "../constants/priority";
import { useWorkspaceConfig } from "@/app/workspaces/hooks/use-workspace-config";
import { STATUS_TO_LABEL_KEY } from "@/app/workspaces/constants/workspace-config-keys";
import { TASK_STATUS_OPTIONS } from "../constants/status";
import { useCustomStatuses } from "@/app/workspaces/hooks/use-custom-statuses";

interface DataFiltersProps {
    hideStatusFilter?: boolean;
}

const DataFilters = ({ hideStatusFilter = false }: DataFiltersProps) => {
    const workspaceId = useWorkspaceId();
    const { data: members, isLoading } = useGetMembers({ workspaceId });
    const t = useTranslations('workspaces');
    const config = useWorkspaceConfig();
    const { allStatuses, getIconComponent } = useCustomStatuses();

    const memberOptions = members?.documents.map(member => ({
        id: member.$id,
        name: member.name
    }));

    const [{
        status,
        assigneeId,
        dueDate,
        priority
    }, setFilters] = useTaskFilters();

    const onStatusChange = (value: string) => {
        if (value === 'all') {
            setFilters({ status: null })
        } else {
            setFilters({ status: value as TaskStatus })
        }
    }

    const onAssigneeChange = (value: string) => {
        setFilters({ assigneeId: value === 'all' ? null : value as string })
    }

    const onPriorityChange = (value: string) => {
        setFilters({ priority: value === 'all' ? null : parseInt(value) })
    }

    if (isLoading) return null;

    return (
        <div className="flex flex-col lg:flex-row gap-2">
            {!hideStatusFilter && (
                <Select
                    defaultValue={status ?? undefined}
                    onValueChange={(value) => onStatusChange(value)}
                >
                    <SelectTrigger className="w-full lg:w-auto h-8 bg-background">
                        <div className="flex items-center pr-2">
                            <ListChecksIcon className="size-4 mr-2" />
                            <SelectValue placeholder={t('all-statuses')} />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('all-statuses')}</SelectItem>
                        <SelectSeparator />
                        {allStatuses.map(statusItem => {
                            const IconComponent = getIconComponent(statusItem.icon);
                            // Para status default, usar traducción o label personalizado
                            const labelKey = statusItem.isDefault ? STATUS_TO_LABEL_KEY[statusItem.id] : null;
                            const customLabel = labelKey ? config[labelKey] : null;
                            const displayLabel = statusItem.isDefault
                                ? (customLabel || t(TASK_STATUS_OPTIONS.find(s => s.value === statusItem.id)?.translationKey || statusItem.id.toLowerCase()))
                                : statusItem.label;

                            return (
                                <SelectItem key={statusItem.id} value={statusItem.id}>
                                    <div className="flex items-center gap-x-2">
                                        <IconComponent className="size-3" style={{ color: statusItem.color }} />
                                        {displayLabel}
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            )}
            <Select
                defaultValue={assigneeId ?? undefined}
                onValueChange={(value) => onAssigneeChange(value)}
            >
                <SelectTrigger className="w-full lg:w-auto h-8 bg-background">
                    <div className="flex items-center pr-2">
                        <UserIcon className="size-4 mr-2" />
                        <SelectValue placeholder={t('all-assignees')} />
                    </div>
                </SelectTrigger>
                <SelectContent >
                    <SelectItem value="all">{t('all-assignees')}</SelectItem>
                    <SelectSeparator />
                    {memberOptions?.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-x-2">
                                <MemberAvatar
                                    className='size-6'
                                    name={member.name}
                                    memberId={member.id}
                                />
                                {member.name}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select
                defaultValue={priority?.toString() ?? undefined}
                onValueChange={(value) => onPriorityChange(value)}
            >
                <SelectTrigger className="w-full lg:w-auto h-8 bg-background">
                    <div className="flex items-center pr-2">
                        <SignalIcon className="size-4 mr-2" />
                        <SelectValue placeholder={t('all-priorities')} />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t('all-priorities')}</SelectItem>
                    <SelectSeparator />
                    {TASK_PRIORITY_OPTIONS.map(priorityOption => {
                        const PriorityIcon = priorityOption.icon;
                        return (
                            <SelectItem key={priorityOption.value} value={priorityOption.value.toString()}>
                                <div className="flex items-center gap-x-2">
                                    <PriorityIcon
                                        className="size-4"
                                        style={{ color: priorityOption.color }}
                                    />
                                    {t(priorityOption.translationKey)}
                                </div>
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
            <CustomDatePicker
                placeholder={'due-date'}
                className="h-8 w-full lg:w-auto"
                value={dueDate ? new Date(dueDate) : undefined}
                onChange={date => { setFilters({ dueDate: date ? date.toISOString() : null }) }}
            />
        </div>
    );
}

export default DataFilters;