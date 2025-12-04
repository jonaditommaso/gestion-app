'use client';
import { useState, useRef, useEffect } from "react";
import { PopulatedChecklistItem } from "../../../checklist/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    Trash2,
    Calendar,
    Users,
    X,
    ClipboardPaste,
    GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateChecklistItem } from "../../../checklist/api/use-update-checklist-item";
import { useDeleteChecklistItem } from "../../../checklist/api/use-delete-checklist-item";
import { useConvertToTask } from "../../../checklist/api/use-convert-to-task";
import { useTranslations } from "next-intl";
import { format, type Locale as DateLocale } from "date-fns";
import { es, enUS, it } from "date-fns/locale";
import { useLocale } from "next-intl";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import CustomDatePicker from "@/components/CustomDatePicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useConfirm } from "@/hooks/use-confirm";

interface ChecklistItemRowProps {
    item: PopulatedChecklistItem;
    taskId: string;
    workspaceId: string;
    members: { $id: string; name: string }[];
    onAssigneeAdd: (itemId: string, memberId: string) => void;
    onAssigneeRemove: (itemId: string, memberId: string) => void;
    readOnly?: boolean;
}

const localeMap: Record<string, DateLocale> = {
    es,
    en: enUS,
    it,
};

export const ChecklistItemRow = ({
    item,
    taskId,
    workspaceId,
    members,
    onAssigneeAdd,
    onAssigneeRemove,
    readOnly = false,
}: ChecklistItemRowProps) => {
    const t = useTranslations('workspaces');
    const locale = useLocale();
    const dateLocale = localeMap[locale] || enUS;

    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(item.title);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showAssignees, setShowAssignees] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Keep hover state visible when any popover/dropdown is open
    const isInteracting = showDatePicker || showAssignees || showDropdown;

    const { mutate: updateItem, isPending: isUpdating } = useUpdateChecklistItem({ taskId });
    const { mutate: deleteItem, isPending: isDeleting } = useDeleteChecklistItem({ taskId });
    const { mutate: convertToTask, isPending: isConverting } = useConvertToTask({ taskId });

    const [DeleteDialog, confirmDelete] = useConfirm(
        t('delete-checklist-item'),
        t('delete-checklist-item-confirm'),
        'destructive'
    );

    const [ConvertDialog, confirmConvert] = useConfirm(
        t('convert-to-task'),
        t('convert-to-task-confirm'),
        'default'
    );

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleToggle = () => {
        if (readOnly) return;
        updateItem({
            json: { completed: !item.completed },
            param: { itemId: item.$id }
        });
    };

    const handleSaveTitle = () => {
        if (title.trim() && title !== item.title) {
            updateItem({
                json: { title: title.trim() },
                param: { itemId: item.$id }
            });
        } else {
            setTitle(item.title);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveTitle();
        } else if (e.key === 'Escape') {
            setTitle(item.title);
            setIsEditing(false);
        }
    };

    const handleDelete = async () => {
        const ok = await confirmDelete();
        if (!ok) return;
        deleteItem({ itemId: item.$id });
    };

    const handleConvert = async () => {
        const ok = await confirmConvert();
        if (!ok) return;
        convertToTask({
            json: { itemId: item.$id, workspaceId }
        });
    };

    const handleDateChange = (date: Date | undefined) => {
        updateItem({
            json: { dueDate: date || null },
            param: { itemId: item.$id }
        });
        setShowDatePicker(false);
    };

    const isPending = isUpdating || isDeleting || isConverting;
    const unassignedMembers = members.filter(
        m => !item.assignees.some(a => a.workspaceMemberId === m.$id)
    );

    return (
        <>
            <DeleteDialog />
            <ConvertDialog />
            <div
                className={cn(
                    "group flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors",
                    item.completed && "opacity-60",
                    isInteracting && "bg-muted/50"
                )}
            >
                {/* Drag handle - visible on hover */}
                {!readOnly && (
                    <div className={cn(
                        "w-4 flex-shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-50 transition-opacity",
                        isInteracting && "opacity-50"
                    )}>
                        <GripVertical className="size-4 text-muted-foreground" />
                    </div>
                )}

                {/* Checkbox */}
                <div onMouseDown={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={item.completed}
                        onCheckedChange={handleToggle}
                        disabled={readOnly}
                        className="size-5"
                    />
                </div>

                {/* Title - click to edit */}
                <div className="flex-1 min-w-0">
                    {!readOnly && isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleSaveTitle}
                            onKeyDown={handleKeyDown}
                            disabled={isPending}
                            className="w-full bg-transparent border-b border-primary focus:outline-none text-sm"
                            onMouseDown={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span
                            className={cn(
                                "text-sm truncate block",
                                item.completed && "line-through text-muted-foreground",
                                !readOnly && "cursor-pointer hover:text-primary transition-colors"
                            )}
                            onMouseDown={(e) => {
                                if (!readOnly) {
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }
                            }}
                        >
                            {item.title}
                        </span>
                    )}
                </div>

                {/* Assignees */}
                {item.assignees.length > 0 && (
                    <div className="flex -space-x-1" onMouseDown={(e) => e.stopPropagation()}>
                        {item.assignees.slice(0, 3).map(assignee => (
                            <MemberAvatar
                                key={assignee.workspaceMemberId}
                                name={assignee.name || '?'}
                                memberId={assignee.workspaceMemberId}
                                className="size-6 border-2 border-background"
                            />
                        ))}
                        {item.assignees.length > 3 && (
                            <div className="size-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                                +{item.assignees.length - 3}
                            </div>
                        )}
                    </div>
                )}

                {/* Due date */}
                {item.dueDate && (
                    <span className={cn(
                        "text-xs whitespace-nowrap",
                        new Date(item.dueDate) < new Date() && !item.completed
                            ? "text-destructive"
                            : "text-muted-foreground"
                    )}>
                        {format(new Date(item.dueDate), 'MMM d', { locale: dateLocale })}
                    </span>
                )}

                {/* Actions */}
                {!readOnly && (
                    <div
                        className={cn(
                            "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                            isInteracting && "opacity-100"
                        )}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        {/* Assignees popover */}
                        <Popover open={showAssignees} onOpenChange={setShowAssignees}>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-7">
                                    <Users className="size-3.5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-2" align="end">
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground px-2">
                                        {t('assignees')}
                                    </p>
                                    {/* Current assignees */}
                                    {item.assignees.map(assignee => (
                                        <div
                                            key={assignee.workspaceMemberId}
                                            className="flex items-center justify-between p-1.5 rounded hover:bg-muted"
                                        >
                                            <div className="flex items-center gap-2">
                                                <MemberAvatar
                                                    name={assignee.name || '?'}
                                                    memberId={assignee.workspaceMemberId}
                                                    className="size-6"
                                                />
                                                <span className="text-sm truncate">
                                                    {assignee.name}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-6"
                                                onClick={() => onAssigneeRemove(item.$id, assignee.workspaceMemberId)}
                                            >
                                                <X className="size-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    {/* Add assignees */}
                                    {unassignedMembers.length > 0 && (
                                        <>
                                            <div className="border-t my-2" />
                                            <p className="text-xs font-medium text-muted-foreground px-2">
                                                {t('add-assignee')}
                                            </p>
                                            {unassignedMembers.map(member => (
                                                <div
                                                    key={member.$id}
                                                    className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer"
                                                    onClick={() => onAssigneeAdd(item.$id, member.$id)}
                                                >
                                                    <MemberAvatar
                                                        name={member.name}
                                                        memberId={member.$id}
                                                        className="size-6"
                                                    />
                                                    <span className="text-sm truncate">
                                                        {member.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Date picker */}
                        <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-7">
                                    <Calendar className="size-3.5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <CustomDatePicker
                                    value={item.dueDate ? new Date(item.dueDate) : undefined}
                                    onChange={handleDateChange}
                                    placeholder="due-date"
                                />
                            </PopoverContent>
                        </Popover>

                        {/* More actions */}
                        <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-7">
                                    <MoreHorizontal className="size-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleConvert} className="cursor-pointer">
                                    <ClipboardPaste className="size-4 mr-2" />
                                    {t('convert-to-task')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    className="text-destructive focus:text-destructive cursor-pointer"
                                >
                                    <Trash2 className="size-4 mr-2" />
                                    {t('delete')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
        </>
    );
};
