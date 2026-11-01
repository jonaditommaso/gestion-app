'use client'
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bookmark, BookmarkCheck, BookmarkPlus, BriefcaseBusiness, CalendarClock, CalendarDays, Check, CheckCircle2Icon, ChevronsUpDown, CircleDot, CircleDotIcon, CircleIcon, ClipboardList, Eye, EyeOff, Flag, Flame, Folder, FunnelPlus, Gauge, Heart, Layers, ListChecksIcon, ListTodo, LoaderCircle, Pencil, Rocket, Search, Settings2, SignalIcon, Sparkles, Star, TagIcon, Target, Timer, Trash2, UserIcon, UserRoundX, Users, X, Zap } from "lucide-react";
import { TaskStatus } from "../types";
import type { SavedTaskFilter } from "@/app/workspaces/types/custom-status";
import { TASK_TYPE_OPTIONS } from '../constants/type'
import { useTaskFilters } from "../hooks/use-task-filters";
import { useGetSquads } from "../api/squads";
import { SQUAD_ICONS } from "./squads/CreateSquadFlow";
import { TaskSquad } from "../types";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMembers } from "@/context/MembersContext";
import { useLabelFilters } from "../hooks/use-label-filters";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useUpdateWorkspace } from "@/features/workspaces/api/use-update-workspace";
import { parseWorkspaceMetadata } from "@/app/workspaces/utils/workspace-metadata";
import { useWorkspacePermissions } from "@/app/workspaces/hooks/use-workspace-permissions";
import { useAppContext } from "@/context/AppContext";
import type { LucideIcon } from "lucide-react";

const SAVED_FILTER_ICONS: LucideIcon[] = [
    Bookmark, BookmarkCheck, BriefcaseBusiness, CalendarDays, CheckCircle2Icon,
    CircleDot, ClipboardList, Flag, Flame, Folder, Gauge, Heart, Layers,
    ListTodo, Rocket, Sparkles, Star, Target, Timer, Zap,
];

const SAVED_FILTER_COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#64748b",
];

interface DataFiltersProps {
    hideStatusFilter?: boolean;
    searchValue: string;
    onSearchChange: (value: string) => void;
    unassignedOnly: boolean;
    dueThisWeekOnly: boolean;
    onUnassignedOnlyChange: (enabled: boolean) => void;
    onDueThisWeekOnlyChange: (enabled: boolean) => void;
}

const DataFilters = ({
    hideStatusFilter = false,
    searchValue,
    onSearchChange,
    unassignedOnly,
    dueThisWeekOnly,
    onUnassignedOnlyChange,
    onDueThisWeekOnlyChange,
}: DataFiltersProps) => {
    const workspaceId = useWorkspaceId();
    const { data: squadsData } = useGetSquads({ workspaceId, enabled: workspaceId !== 'create' });
    const t = useTranslations('workspaces');
    const { isFree } = usePlanAccess();
    const taskTypeOptions = isFree ? TASK_TYPE_OPTIONS.filter((opt) => opt.value !== 'epic' && opt.value !== 'spike' && opt.value !== 'test') : TASK_TYPE_OPTIONS;
    const config = useWorkspaceConfig();
    const { allStatuses, getIconComponent } = useCustomStatuses();
    const { customLabels, getLabelColor } = useCustomLabels();
    const isMultiSelectLabels = config[WorkspaceConfigKey.MULTI_SELECT_LABELS];
    const [labelPopoverOpen, setLabelPopoverOpen] = useState(false);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [manageDialogOpen, setManageDialogOpen] = useState(false);
    const [editingSavedFilterId, setEditingSavedFilterId] = useState<string | null>(null);
    const [savedFilterToDelete, setSavedFilterToDelete] = useState<string | null>(null);
    const [pendingSavedFilterAction, setPendingSavedFilterAction] = useState<{
        id: string;
        action: 'visibility' | 'edit' | 'delete';
    } | null>(null);
    const [replaceConditionsWithCurrent, setReplaceConditionsWithCurrent] = useState(false);
    const [savedFilterName, setSavedFilterName] = useState('');
    const [savedFilterIcon, setSavedFilterIcon] = useState('0');
    const [savedFilterColor, setSavedFilterColor] = useState(SAVED_FILTER_COLORS[0]);
    const [includedQuickFilters, setIncludedQuickFilters] = useState<string[]>([]);
    const { data: workspaces } = useGetWorkspaces();
    const { mutate: updateWorkspace, isPending: isSavingFilter } = useUpdateWorkspace();
    const { isWorkspaceAdmin } = useWorkspacePermissions();
    const { isDemo } = useAppContext();
    const canSaveFilters = isWorkspaceAdmin && !isDemo;
    const currentWorkspace = workspaces?.documents.find(workspace => workspace.$id === workspaceId);
    const workspaceMetadata = parseWorkspaceMetadata(currentWorkspace?.metadata);
    const savedFilters = workspaceMetadata.savedTaskFilters ?? [];
    const hiddenQuickFilters = workspaceMetadata.hiddenQuickFilters ?? [];
    const visibleSavedFilters = savedFilters.filter(savedFilter => !savedFilter.hidden);

    const { members } = useMembers()

    const memberOptions = members?.map(member => ({
        id: member.$id,
        name: member.name
    }));

    const [{
        status,
        assigneeId,
        squadId,
        dueDate,
        priority,
        label,
        type,
        completed
    }, setFilters] = useTaskFilters();

    // Check if any filter is active
    const hasActiveFilters = status || assigneeId || squadId || dueDate || priority || (label && label.length > 0) || type || completed || unassignedOnly || dueThisWeekOnly;

    // Is not the ideal solution, but it works for now.
    // Before this custom hook, we used SelectValue inside SelectTrigger
    // Todo: Refactor. Find a better solution.
    const {
        selectedStatusLabel,
        selectedAssigneeLabel,
        selectedSquadLabel,
        selectedPriorityLabel,
        selectedLabelName,
        selectedTypeLabel,
        selectedCompletedLabel
    } = useLabelFilters({
        status,
        assigneeId,
        squadId,
        dueDate,
        priority,
        label,
        type,
        completed,
        allStatuses,
        memberOptions,
        squadsData,
        customLabels,
        taskTypeOptions
    });

    const clearAllFilters = () => {
        setFilters({
            status: null,
            assigneeId: null,
            squadId: null,
            dueDate: null,
            priority: null,
            label: null,
            type: null,
            completed: null
        });
        onUnassignedOnlyChange(false);
        onDueThisWeekOnlyChange(false);
    };

    const openSaveFilterDialog = () => {
        setEditingSavedFilterId(null);
        setReplaceConditionsWithCurrent(false);
        setSavedFilterName('');
        setSavedFilterIcon('0');
        setSavedFilterColor(SAVED_FILTER_COLORS[0]);
        setIncludedQuickFilters([
            ...(unassignedOnly ? ['unassigned'] : []),
            ...(dueThisWeekOnly ? ['dueThisWeek'] : []),
        ]);
        setSaveDialogOpen(true);
    };

    const currentFilterValues = {
        status,
        assigneeId,
        squadId,
        dueDate,
        priority,
        label,
        type,
        completed,
    };

    const filtersMatch = (left: SavedTaskFilter['filters'], right: SavedTaskFilter['filters']) => {
        const leftLabels = [...(left.label ?? [])].sort();
        const rightLabels = [...(right.label ?? [])].sort();
        return left.status === right.status
            && left.assigneeId === right.assigneeId
            && left.squadId === right.squadId
            && left.dueDate === right.dueDate
            && left.priority === right.priority
            && left.type === right.type
            && left.completed === right.completed
            && leftLabels.length === rightLabels.length
            && leftLabels.every((value, index) => value === rightLabels[index]);
    };

    const editingFilter = savedFilters.find(filter => filter.id === editingSavedFilterId);
    const filterValuesToSave = replaceConditionsWithCurrent || !editingFilter
        ? currentFilterValues
        : editingFilter.filters;
    const isDuplicateSavedFilter = savedFilters.some(savedFilter =>
        savedFilter.id !== editingSavedFilterId
        && filtersMatch(filterValuesToSave, savedFilter.filters)
        && savedFilter.unassignedOnly === includedQuickFilters.includes('unassigned')
        && savedFilter.dueThisWeekOnly === includedQuickFilters.includes('dueThisWeek')
    );
    const activeSavedFilter = visibleSavedFilters.find(savedFilter =>
        filtersMatch(savedFilter.filters, currentFilterValues)
        && savedFilter.unassignedOnly === unassignedOnly
        && savedFilter.dueThisWeekOnly === dueThisWeekOnly
    );

    const updateWorkspaceMetadata = (
        metadata: typeof workspaceMetadata,
        action?: { id: string; type: 'visibility' | 'edit' | 'delete' },
        onSuccess?: () => void,
    ) => {
        if (!currentWorkspace) return;
        if (action) setPendingSavedFilterAction({ id: action.id, action: action.type });
        updateWorkspace({
            json: {
                metadata: JSON.stringify(metadata),
            },
            param: { workspaceId },
        }, {
            onSuccess: () => {
                setPendingSavedFilterAction(null);
                onSuccess?.();
            },
            onError: () => setPendingSavedFilterAction(null),
        });
    };

    const updateSavedFilters = (
        nextSavedFilters: SavedTaskFilter[],
        action?: { id: string; type: 'visibility' | 'edit' | 'delete' },
        onSuccess?: () => void,
    ) => updateWorkspaceMetadata({
        ...workspaceMetadata,
        savedTaskFilters: nextSavedFilters,
    }, action, onSuccess);

    const openEditSavedFilter = (savedFilter: SavedTaskFilter) => {
        setEditingSavedFilterId(savedFilter.id);
        setSavedFilterName(savedFilter.name);
        setSavedFilterIcon(savedFilter.icon);
        setSavedFilterColor(savedFilter.color);
        setReplaceConditionsWithCurrent(false);
        setIncludedQuickFilters([
            ...(savedFilter.unassignedOnly ? ['unassigned'] : []),
            ...(savedFilter.dueThisWeekOnly ? ['dueThisWeek'] : []),
        ]);
        setManageDialogOpen(false);
        setSaveDialogOpen(true);
    };

    const toggleSavedFilterVisibility = (savedFilter: SavedTaskFilter, hidden: boolean) => {
        updateSavedFilters(savedFilters.map(filter =>
            filter.id === savedFilter.id ? { ...filter, hidden } : filter
        ), { id: savedFilter.id, type: 'visibility' });
    };

    const toggleQuickFilterVisibility = (filterId: 'unassigned' | 'dueThisWeek') => {
        const hidden = hiddenQuickFilters.includes(filterId);
        const nextHiddenQuickFilters = hidden
            ? hiddenQuickFilters.filter(id => id !== filterId)
            : [...hiddenQuickFilters, filterId];
        updateWorkspaceMetadata({
            ...workspaceMetadata,
            hiddenQuickFilters: nextHiddenQuickFilters,
        }, { id: `quick-${filterId}`, type: 'visibility' });
    };

    const deleteSavedFilter = () => {
        if (!savedFilterToDelete) return;
        const deletingId = savedFilterToDelete;
        updateSavedFilters(
            savedFilters.filter(filter => filter.id !== deletingId),
            { id: deletingId, type: 'delete' },
            () => setSavedFilterToDelete(null)
        );
    };

    const saveCurrentFilter = () => {
        const name = savedFilterName.trim();
        if (!name || !currentWorkspace || isDuplicateSavedFilter) return;
        const savedFilter: SavedTaskFilter = {
            id: editingSavedFilterId ?? crypto.randomUUID(),
            name,
            icon: savedFilterIcon,
            color: savedFilterColor,
            filters: filterValuesToSave,
            unassignedOnly: includedQuickFilters.includes('unassigned'),
            dueThisWeekOnly: includedQuickFilters.includes('dueThisWeek'),
            hidden: editingFilter?.hidden,
        };
        const nextSavedFilters = editingSavedFilterId
            ? savedFilters.map(filter => filter.id === editingSavedFilterId ? savedFilter : filter)
            : [...savedFilters, savedFilter];
        updateSavedFilters(nextSavedFilters, editingSavedFilterId
            ? { id: editingSavedFilterId, type: 'edit' }
            : undefined, () => {
            setSaveDialogOpen(false);
            setEditingSavedFilterId(null);
            setReplaceConditionsWithCurrent(false);
        });
    };

    const applySavedFilter = (savedFilter: SavedTaskFilter) => {
        setFilters(savedFilter.filters);
        onUnassignedOnlyChange(savedFilter.unassignedOnly);
        onDueThisWeekOnlyChange(savedFilter.dueThisWeekOnly);
        setManageDialogOpen(false);
    };

    const activeFilters: { id: string; label: string; onRemove: () => void; color?: string }[] = [];
    if (status) {
        const statusColor = allStatuses.find(statusItem => statusItem.id === status)?.color;
        activeFilters.push({
            id: 'status',
            label: `${t('status')}: ${selectedStatusLabel}`,
            onRemove: () => setFilters({ status: null }),
            color: statusColor ?? undefined,
        });
    }
    if (assigneeId) activeFilters.push({
        id: 'assignee',
        label: `${t('assignee')}: ${selectedAssigneeLabel}`,
        onRemove: () => setFilters({ assigneeId: null }),
    });
    if (squadId) activeFilters.push({
        id: 'squad',
        label: `${t('squad')}: ${selectedSquadLabel}`,
        onRemove: () => setFilters({ squadId: null }),
    });
    if (dueDate) activeFilters.push({
        id: 'due-date',
        label: `${t('due-date')}: ${new Date(dueDate).toLocaleDateString()}`,
        onRemove: () => setFilters({ dueDate: null }),
    });
    if (priority !== null && priority !== undefined) activeFilters.push({
        id: 'priority',
        label: `${t('priority')}: ${selectedPriorityLabel}`,
        onRemove: () => setFilters({ priority: null }),
    });
    label?.forEach(labelId => {
        const labelName = customLabels.find(labelItem => labelItem.id === labelId)?.name ?? selectedLabelName;
        activeFilters.push({
            id: `label-${labelId}`,
            label: `${t('labels')}: ${labelName}`,
            onRemove: () => onMultiLabelChange((label ?? []).filter(id => id !== labelId)),
        });
    });
    if (type) activeFilters.push({
        id: 'type',
        label: `${t('type')}: ${selectedTypeLabel}`,
        onRemove: () => setFilters({ type: null }),
    });
    if (completed) activeFilters.push({
        id: 'completed',
        label: `${t('completed')}: ${selectedCompletedLabel}`,
        onRemove: () => setFilters({ completed: null }),
    });
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

    const onSquadChange = (value: string) => {
        setFilters({ squadId: value === 'all' ? null : value })
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

    const onTypeChange = (value: string) => {
        setFilters({ type: value === 'all' ? null : value })
    }

    const onCompletedChange = (value: string) => {
        setFilters({ completed: value === 'all' ? null : value })
    }


    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-[260px]">
                    <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={t('search-by-name')}
                        value={searchValue}
                        onChange={(event) => onSearchChange(event.target.value)}
                        className="h-8 bg-background pl-8"
                    />
                </div>
                <Separator orientation="vertical" className="mx-1 h-6" />
                {!hiddenQuickFilters.includes('unassigned') && (
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        aria-pressed={unassignedOnly}
                        onClick={() => onUnassignedOnlyChange(!unassignedOnly)}
                        className={cn(
                            "h-7 rounded-full bg-background/80 px-3 text-xs",
                            unassignedOnly && "border-primary bg-primary/10 text-primary"
                        )}
                    >
                        <UserRoundX className="size-3.5" />
                        {t('filter-unassigned')}
                    </Button>
                )}
                {!hiddenQuickFilters.includes('dueThisWeek') && (
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        aria-pressed={dueThisWeekOnly}
                        onClick={() => onDueThisWeekOnlyChange(!dueThisWeekOnly)}
                        className={cn(
                            "h-7 rounded-full bg-background/80 px-3 text-xs",
                            dueThisWeekOnly && "border-primary bg-primary/10 text-primary"
                        )}
                    >
                        <CalendarClock className="size-3.5" />
                        {t('filter-due-this-week')}
                    </Button>
                )}
                {visibleSavedFilters.map(savedFilter => {
                    const Icon = SAVED_FILTER_ICONS[Number(savedFilter.icon)] ?? Bookmark;
                    const isActive = activeSavedFilter?.id === savedFilter.id;
                    return (
                        <button
                            key={savedFilter.id}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => isActive ? clearAllFilters() : applySavedFilter(savedFilter)}
                            className={cn(
                                "inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
                                !isActive && "bg-background/80 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                            style={{
                                borderColor: `color-mix(in srgb, ${savedFilter.color} ${isActive ? '50%' : '25%'}, transparent)`,
                                ...(isActive ? {
                                    backgroundColor: `color-mix(in srgb, ${savedFilter.color} 12%, transparent)`,
                                    color: savedFilter.color,
                                } : {}),
                            }}
                        >
                            <Icon className="size-3.5" />
                            {savedFilter.name}
                        </button>
                    );
                })}
                <div className="ml-auto">
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setManageDialogOpen(true)}
                    className="mr-2 h-8 gap-2 bg-background/80"
                >
                    <Bookmark className="size-4" />
                    {t('quick-filters')}
                </Button>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className={cn(
                                "h-8 gap-2 bg-background/80",
                                hasActiveFilters && "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                            )}
                        >
                            <FunnelPlus className="size-4" />
                            {t('filters')}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-[min(92vw,640px)] p-3">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {!hideStatusFilter && (
                <div>
                <Select
                    value={status ?? 'all'}
                    defaultValue="all"
                    onValueChange={(value) => onStatusChange(value)}
                >
                    <SelectTrigger className="w-full h-8 bg-background">
                        <div className="flex items-center pr-2">
                            <ListChecksIcon className="size-4 mr-2" />
                            <span className="truncate">{selectedStatusLabel}</span>
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
                </div>
            )}
            <div>
            <Select
                value={assigneeId ?? 'all'}
                onValueChange={(value) => onAssigneeChange(value)}
            >
                <SelectTrigger className="w-full h-8 bg-background">
                    <div className="flex items-center pr-2">
                        <UserIcon className="size-4 mr-2" />
                        <span className="truncate">{selectedAssigneeLabel}</span>
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
            </div>
            {!isFree && (
                <div>
                <Select
                    value={squadId ?? 'all'}
                    onValueChange={(value) => onSquadChange(value)}
                >
                    <SelectTrigger className="w-full h-8 bg-background">
                        <div className="flex items-center pr-2">
                            <Users className="size-4 mr-2" />
                            <span className="truncate">{selectedSquadLabel}</span>
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('all-squads')}</SelectItem>
                        {(squadsData?.documents?.length ?? 0) > 0 && <SelectSeparator />}
                        {squadsData?.documents?.map(squad => {
                            const sq = squad as unknown as TaskSquad;
                            const rawMeta = (() => { try { return sq.metadata ? (JSON.parse(sq.metadata) as { color?: string | null; icon?: string | null }) : null; } catch { return null; } })();
                            const color = rawMeta?.color ?? null;
                            const rawIcon = rawMeta?.icon ?? null;
                            const iconDef = rawIcon ? SQUAD_ICONS.find(i => i.id === rawIcon) : null;
                            const IconComp = iconDef?.icon;
                            return (
                                <SelectItem key={squad.$id} value={squad.$id}>
                                    <div className="flex items-center gap-x-2">
                                        {IconComp && <IconComp className="size-4" style={color ? { color } : undefined} />}
                                        <span style={color ? { color } : undefined}>{squad.name}</span>
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
                </div>
            )}
            <div>
            <Select
                value={priority?.toString() ?? 'all'}
                onValueChange={(value) => onPriorityChange(value)}
            >
                <SelectTrigger className="w-full h-8 bg-background">
                    <div className="flex items-center pr-2">
                        <SignalIcon className="size-4 mr-2" />
                        <span className="truncate">{selectedPriorityLabel}</span>
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
            </div>
            {isMultiSelectLabels ? (
                <div>
                <Popover open={labelPopoverOpen} onOpenChange={setLabelPopoverOpen}>
                    <PopoverTrigger asChild>
                        <button
                            className="flex h-8 w-full items-center justify-between rounded-md border bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground"
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
                {(
                    <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        aria-label={t('manage-saved-filters')}
                        title={t('manage-saved-filters')}
                        onClick={() => setManageDialogOpen(true)}
                        className="ml-1 size-8 bg-background/80"
                    >
                        <Settings2 className="size-4" />
                    </Button>
                )}
                </div>
            ) : (
                <div>
                <Select
                    value={label?.[0] ?? 'all'}
                    onValueChange={onLabelChange}
                >
                    <SelectTrigger className="w-full h-8 bg-background">
                        <div className="flex items-center pr-2">
                            <TagIcon className="size-4 mr-2" />
                            <span className="truncate">{selectedLabelName}</span>
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
                </div>
            )}
            <div>
            <Select
                value={type ?? 'all'}
                onValueChange={(value) => onTypeChange(value)}
            >
                <SelectTrigger className="w-full h-8 bg-background">
                    <div className="flex items-center pr-2">
                        <CircleDotIcon className="size-4 mr-2" />
                        <span className="truncate">{selectedTypeLabel}</span>
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t('all-types')}</SelectItem>
                    <SelectSeparator />
                    {taskTypeOptions.map(typeOption => {
                        const TypeIcon = typeOption.icon;
                        return (
                            <SelectItem key={typeOption.value} value={typeOption.value}>
                                <div className="flex items-center gap-x-2">
                                    <TypeIcon className={cn("size-4", typeOption.textColor)} />
                                    {t(typeOption.translationKey)}
                                </div>
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
            </div>
            <div>
            <Select
                value={completed ?? 'all'}
                onValueChange={(value) => onCompletedChange(value)}
            >
                <SelectTrigger className="w-full h-8 bg-background">
                    <div className="flex items-center pr-2">
                        <CheckCircle2Icon className="size-4 mr-2" />
                        <span className="truncate">{selectedCompletedLabel}</span>
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t('all-completed')}</SelectItem>
                    <SelectSeparator />
                    <SelectItem value="completed">
                        <div className="flex items-center gap-x-2">
                            <CheckCircle2Icon className="size-4 text-green-600" />
                            {t('completed')}
                        </div>
                    </SelectItem>
                    <SelectItem value="incomplete">
                        <div className="flex items-center gap-x-2">
                            <CircleIcon className="size-4 text-muted-foreground" />
                            {t('incomplete')}
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>
            </div>
            <div>
            <CustomDatePicker
                placeholder={'due-date'}
                className="h-8 w-full"
                value={dueDate ? new Date(dueDate) : undefined}
                onChange={date => { setFilters({ dueDate: date ? date.toISOString() : null }) }}
            />
            </div>
                        </div>
                    </PopoverContent>
                </Popover>
                </div>
            </div>
            {activeFilters.length > 0 && !activeSavedFilter && (
                <div className="flex flex-wrap items-center gap-1.5">
                    {activeFilters.map((filter) => (
                        <span
                            key={filter.id}
                            className={cn(
                                "inline-flex h-7 items-center gap-1 rounded-md border bg-background/70 pl-2 text-xs text-muted-foreground",
                                filter.color && "font-medium"
                            )}
                            style={filter.color ? {
                                borderColor: `color-mix(in srgb, ${filter.color} 50%, transparent)`,
                                backgroundColor: `color-mix(in srgb, ${filter.color} 12%, transparent)`,
                                color: filter.color,
                            } : undefined}
                        >
                            {filter.label}
                            <button
                                type="button"
                                aria-label={`${t('clear-filter')}: ${filter.label}`}
                                onClick={filter.onRemove}
                                className="mr-1 inline-flex size-5 items-center justify-center rounded-sm opacity-70 transition-opacity hover:bg-foreground/10 hover:opacity-100"
                            >
                                <X className="size-3" />
                            </button>
                        </span>
                    ))}
                    <div className="ml-auto flex items-center gap-1">
                        {canSaveFilters && (
                            <Button
                                type="button"
                                size="sm"
                                onClick={openSaveFilterDialog}
                                disabled={isDuplicateSavedFilter}
                                className="h-8 bg-blue-600/10 text-blue-700 hover:bg-blue-600/20 dark:text-blue-300"
                            >
                                <BookmarkPlus className="mr-1 size-4" />
                                {t('save-filter')}
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="size-4 mr-1" />
                            {t('clear-filters')}
                        </Button>
                    </div>
                </div>
            )}
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t(editingSavedFilterId ? 'edit-saved-filter' : 'save-filter-title')}</DialogTitle>
                        <DialogDescription>{t('save-filter-description')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="saved-filter-name" className="text-sm font-medium">{t('filter-name')}</label>
                            <Input
                                id="saved-filter-name"
                                value={savedFilterName}
                                onChange={event => setSavedFilterName(event.target.value)}
                                maxLength={50}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('icon')}</label>
                            <Select value={savedFilterIcon} onValueChange={setSavedFilterIcon}>
                                <SelectTrigger className="h-9">
                                    <SelectValue>
                                        {(() => {
                                            const Icon = SAVED_FILTER_ICONS[Number(savedFilterIcon)] ?? Bookmark;
                                            return <Icon className="size-4" />;
                                        })()}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {SAVED_FILTER_ICONS.map((Icon, index) => (
                                        <SelectItem key={index} value={String(index)}>
                                            <span className="flex items-center gap-2">
                                                <Icon className="size-4" />
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">{t('color')}</p>
                            <div className="flex items-center gap-2">
                                {SAVED_FILTER_COLORS.map((color, index) => (
                                    <button
                                        key={color}
                                        type="button"
                                        aria-label={t('color-option', { number: index + 1 })}
                                        aria-pressed={savedFilterColor === color}
                                        onClick={() => setSavedFilterColor(color)}
                                        className={cn(
                                            "size-7 rounded-full border-2 transition-transform",
                                            savedFilterColor === color ? "scale-110 border-foreground" : "border-transparent"
                                        )}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">{t('include-quick-filters')}</p>
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={includedQuickFilters.includes('unassigned')}
                                    onCheckedChange={checked => setIncludedQuickFilters(current => checked
                                        ? [...current, 'unassigned']
                                        : current.filter(filter => filter !== 'unassigned'))}
                                />
                                {t('filter-unassigned')}
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={includedQuickFilters.includes('dueThisWeek')}
                                    onCheckedChange={checked => setIncludedQuickFilters(current => checked
                                        ? [...current, 'dueThisWeek']
                                        : current.filter(filter => filter !== 'dueThisWeek'))}
                                />
                                {t('filter-due-this-week')}
                            </label>
                        </div>
                        {editingSavedFilterId && (
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={replaceConditionsWithCurrent}
                                    onCheckedChange={checked => setReplaceConditionsWithCurrent(checked === true)}
                                />
                                {t('replace-filter-conditions')}
                            </label>
                        )}
                        {isDuplicateSavedFilter && (
                            <p className="text-sm text-destructive">{t('duplicate-saved-filter')}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={saveCurrentFilter}
                            disabled={!savedFilterName.trim() || !currentWorkspace || isSavingFilter || isDuplicateSavedFilter}
                        >
                            {isSavingFilter
                                ? <LoaderCircle className="mr-2 size-4 animate-spin" />
                                : <BookmarkPlus className="mr-2 size-4" />}
                            {t('save-filter')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{t('manage-saved-filters')}</DialogTitle>
                        <DialogDescription>{t('manage-saved-filters-description')}</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[55vh] space-y-2 overflow-y-auto">
                        {([
                            { id: 'unassigned', icon: UserRoundX, label: t('filter-unassigned') },
                            { id: 'dueThisWeek', icon: CalendarClock, label: t('filter-due-this-week') },
                        ] as const).map(quickFilter => {
                            const isHidden = hiddenQuickFilters.includes(quickFilter.id);
                            const isUpdating = isSavingFilter
                                && pendingSavedFilterAction?.id === `quick-${quickFilter.id}`
                                && pendingSavedFilterAction.action === 'visibility';
                            const QuickFilterIcon = quickFilter.icon;
                            return (
                                <div key={quickFilter.id} className="flex items-center gap-3 rounded-lg border p-3">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                        <QuickFilterIcon className="size-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{quickFilter.label}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {isHidden ? t('saved-filter-hidden') : t('saved-filter-visible')}
                                        </p>
                                    </div>
                                    {canSaveFilters && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={isSavingFilter}
                                            aria-label={isHidden ? t('show-saved-filter') : t('hide-saved-filter')}
                                            title={isHidden ? t('show-saved-filter') : t('hide-saved-filter')}
                                            onClick={() => toggleQuickFilterVisibility(quickFilter.id)}
                                        >
                                            {isUpdating
                                                ? <LoaderCircle className="size-4 animate-spin" />
                                                : isHidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                        {savedFilters.length === 0 && (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                {t('no-saved-filters')}
                            </p>
                        )}
                        {savedFilters.map(savedFilter => {
                            const Icon = SAVED_FILTER_ICONS[Number(savedFilter.icon)] ?? Bookmark;
                            return (
                                <div key={savedFilter.id} className="flex items-center gap-3 rounded-lg border p-3">
                                    <span
                                        className="flex size-8 shrink-0 items-center justify-center rounded-md"
                                        style={{ color: savedFilter.color, backgroundColor: `color-mix(in srgb, ${savedFilter.color} 14%, transparent)` }}
                                    >
                                        <Icon className="size-4" />
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        disabled={!!savedFilter.hidden}
                                        onClick={() => applySavedFilter(savedFilter)}
                                        className="h-auto min-w-0 flex-1 justify-start px-2 py-1 text-left"
                                    >
                                        <span className="min-w-0">
                                        <p className={cn("truncate text-sm font-medium", savedFilter.hidden && "text-muted-foreground")}>
                                            {savedFilter.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {savedFilter.hidden ? t('saved-filter-hidden') : t('saved-filter-visible')}
                                        </p>
                                        </span>
                                    </Button>
                                    {canSaveFilters && (
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={isSavingFilter}
                                            aria-label={savedFilter.hidden ? t('show-saved-filter') : t('hide-saved-filter')}
                                            title={savedFilter.hidden ? t('show-saved-filter') : t('hide-saved-filter')}
                                            onClick={() => toggleSavedFilterVisibility(savedFilter, !savedFilter.hidden)}
                                        >
                                            {isSavingFilter && pendingSavedFilterAction?.id === savedFilter.id && pendingSavedFilterAction.action === 'visibility'
                                                ? <LoaderCircle className="size-4 animate-spin" />
                                                : savedFilter.hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={isSavingFilter}
                                            aria-label={t('edit-saved-filter')}
                                            title={t('edit-saved-filter')}
                                            onClick={() => openEditSavedFilter(savedFilter)}
                                        >
                                            {isSavingFilter && pendingSavedFilterAction?.id === savedFilter.id && pendingSavedFilterAction.action === 'edit'
                                                ? <LoaderCircle className="size-4 animate-spin" />
                                                : <Pencil className="size-4" />}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={isSavingFilter}
                                            aria-label={t('delete-saved-filter')}
                                            title={t('delete-saved-filter')}
                                            onClick={() => setSavedFilterToDelete(savedFilter.id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            {isSavingFilter && pendingSavedFilterAction?.id === savedFilter.id && pendingSavedFilterAction.action === 'delete'
                                                ? <LoaderCircle className="size-4 animate-spin" />
                                                : <Trash2 className="size-4" />}
                                        </Button>
                                    </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={!!savedFilterToDelete} onOpenChange={open => {
                if (!open) setSavedFilterToDelete(null);
            }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t('delete-saved-filter')}</DialogTitle>
                        <DialogDescription>{t('delete-saved-filter-confirmation')}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setSavedFilterToDelete(null)} disabled={isSavingFilter}>
                            {t('cancel')}
                        </Button>
                        <Button type="button" variant="destructive" onClick={deleteSavedFilter} disabled={isSavingFilter}>
                            {isSavingFilter
                                ? <LoaderCircle className="mr-2 size-4 animate-spin" />
                                : <Trash2 className="mr-2 size-4" />}
                            {t('delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default DataFilters;