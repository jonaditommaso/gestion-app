'use client'
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListChecksIcon, UserIcon, SignalIcon, TagIcon, Check, ChevronsUpDown } from "lucide-react";
import { TaskStatus } from "../types";
import { useTaskFilters } from "../hooks/use-task-filters";
import CustomDatePicker from "@/components/CustomDatePicker";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import { useTranslations } from "next-intl";
import { TASK_PRIORITY_OPTIONS } from "../constants/priority";
import { useWorkspaceConfig } from "@/app/workspaces/hooks/use-workspace-config";
import { STATUS_TO_LABEL_KEY, WorkspaceConfigKey } from "@/app/workspaces/constants/workspace-config-keys";
import { TASK_STATUS_OPTIONS } from "../constants/status";
import { useCustomStatuses } from "@/app/workspaces/hooks/use-custom-statuses";
import { useCustomLabels } from "@/app/workspaces/hooks/use-custom-labels";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DataFiltersProps {
    hideStatusFilter?: boolean;
}

const DataFilters = ({ hideStatusFilter = false }: DataFiltersProps) => {
    const workspaceId = useWorkspaceId();
    const { data: members, isLoading } = useGetMembers({ workspaceId });
    const t = useTranslations('workspaces');
    const config = useWorkspaceConfig();
    const { allStatuses, getIconComponent } = useCustomStatuses();
    const { customLabels, getLabelColor } = useCustomLabels();
    const isMultiSelectLabels = config[WorkspaceConfigKey.MULTI_SELECT_LABELS];
    const [labelPopoverOpen, setLabelPopoverOpen] = useState(false);

    const memberOptions = members?.documents.map(member => ({
        id: member.$id,
        name: member.name
    }));

    const [{
        status,
        assigneeId,
        dueDate,
        priority,
        label
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

    const onLabelChange = (value: string) => {
        setFilters({ label: value === 'all' ? null : [value] })
    }

    const onMultiLabelChange = (values: string[]) => {
        setFilters({ label: values.length > 0 ? values : null })
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
            {isMultiSelectLabels ? (
                <Popover open={labelPopoverOpen} onOpenChange={setLabelPopoverOpen}>
                    <PopoverTrigger asChild>
                        <button
                            className="flex items-center justify-between w-full lg:w-auto h-8 px-3 bg-background border rounded-md text-sm hover:bg-accent hover:text-accent-foreground"
                        >
                            <div className="flex items-center gap-2">
                                <TagIcon className="size-4" />
                                {label && label.length > 0 ? (
                                    <div className="flex items-center gap-1">
                                        {label.slice(0, 5).map(labelId => {
                                            const labelItem = customLabels.find(l => l.id === labelId);
                                            const colorInfo = labelItem ? getLabelColor(labelItem.color) : null;
                                            return (
                                                <div
                                                    key={labelId}
                                                    className="size-3 rounded-sm"
                                                    style={{ backgroundColor: colorInfo?.value || labelItem?.color || '#888' }}
                                                    title={labelItem?.name}
                                                />
                                            );
                                        })}
                                        {label.length > 5 && (
                                            <span className="text-xs text-muted-foreground">+{label.length - 5}</span>
                                        )}
                                    </div>
                                ) : (
                                    <span>{t('all-labels')}</span>
                                )}
                            </div>
                            <ChevronsUpDown className="size-4 ml-2 opacity-50" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-fit min-w-[200px] p-0" align="start">
                        <Command>
                            <CommandInput placeholder={t('search')} />
                            <CommandList>
                                <CommandEmpty>{t('no-results')}</CommandEmpty>
                                <CommandGroup>
                                    {customLabels.map(labelItem => {
                                        const isSelected = label?.includes(labelItem.id) ?? false;
                                        const colorInfo = getLabelColor(labelItem.color);
                                        return (
                                            <CommandItem
                                                key={labelItem.id}
                                                onSelect={() => {
                                                    if (isSelected) {
                                                        onMultiLabelChange((label ?? []).filter(l => l !== labelItem.id));
                                                    } else {
                                                        onMultiLabelChange([...(label ?? []), labelItem.id]);
                                                    }
                                                }}
                                                className="whitespace-nowrap"
                                            >
                                                <div
                                                    className={cn(
                                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                                                    )}
                                                >
                                                    {isSelected && <Check className="size-3" />}
                                                </div>
                                                <div
                                                    className="size-3 rounded-full mr-2"
                                                    style={{ backgroundColor: colorInfo?.value || labelItem.color }}
                                                />
                                                {labelItem.name}
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            ) : (
                <Select
                    defaultValue={label?.[0] ?? undefined}
                    onValueChange={onLabelChange}
                >
                    <SelectTrigger className="w-full lg:w-auto h-8 bg-background">
                        <div className="flex items-center pr-2">
                            <TagIcon className="size-4 mr-2" />
                            <SelectValue placeholder={t('all-labels')} />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('all-labels')}</SelectItem>
                        {customLabels.length > 0 ? (
                            <>
                                <SelectSeparator />
                                {customLabels.map(labelItem => {
                                    const colorInfo = getLabelColor(labelItem.color);
                                    return (
                                        <SelectItem key={labelItem.id} value={labelItem.id}>
                                            <div className="flex items-center gap-x-2">
                                                <div
                                                    className="size-3 rounded-full"
                                                    style={{ backgroundColor: colorInfo?.value || labelItem.color }}
                                                />
                                                {labelItem.name}
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </>
                        ) : (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                {t('no-labels-available')}
                            </div>
                        )}
                    </SelectContent>
                </Select>
            )}
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