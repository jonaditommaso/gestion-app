'use client';
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useGetChecklistItems } from "../../../checklist/api/use-get-checklist-items";
import { useCreateChecklistItem } from "../../../checklist/api/use-create-checklist-item";
import { useUpdateChecklistItem } from "../../../checklist/api/use-update-checklist-item";
import { useAddChecklistAssignee } from "../../../checklist/api/use-add-checklist-assignee";
import { useRemoveChecklistAssignee } from "../../../checklist/api/use-remove-checklist-assignee";
import { ChecklistItemRow } from "./ChecklistItemRow";
import { ChecklistProgress } from "./ChecklistProgress";
import { PopulatedChecklistItem, calculatePosition, POSITION_GAP } from "../../../checklist/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ListChecks, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
    DragDropContext,
    Droppable,
    Draggable,
    type DropResult,
    type DraggableProvided,
    type DraggableStateSnapshot
} from '@hello-pangea/dnd';
import DraggablePortal from "@/components/DraggablePortal";
import EditableText from "@/components/EditableText";

interface ChecklistProps {
    taskId: string;
    workspaceId: string;
    members: { $id: string; name: string }[];
    readOnly?: boolean;
    checklistCount?: number;
    savedChecklistTitle?: string; // Title saved in the task
    onTitleChange?: (title: string) => void; // Callback to update title
}

export const Checklist = ({ taskId, workspaceId, members, readOnly = false, checklistCount = 0, savedChecklistTitle, onTitleChange }: ChecklistProps) => {
    const t = useTranslations('workspaces');
    const [isCreatingChecklist, setIsCreatingChecklist] = useState(false);
    const [checklistTitle, setChecklistTitle] = useState('');
    const [newItemTitle, setNewItemTitle] = useState('');
    const [hasCreatedItem, setHasCreatedItem] = useState(false);
    const [isAddingItems, setIsAddingItems] = useState(false);
    const [isInputVisible, setIsInputVisible] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const hasChecklist = checklistCount > 0 || hasCreatedItem;
    const shouldFetch = hasChecklist;

    const { data, isLoading } = useGetChecklistItems({ taskId, enabled: shouldFetch });
    const { mutate: createItem, isPending: isCreating } = useCreateChecklistItem();
    const { mutate: updateItem } = useUpdateChecklistItem({ taskId });
    const { mutate: addAssignee } = useAddChecklistAssignee({ taskId });
    const { mutate: removeAssignee } = useRemoveChecklistAssignee({ taskId });

    // Server items sorted by position
    const serverItems = useMemo(() =>
        ((data?.documents || []) as PopulatedChecklistItem[]).sort((a, b) => a.position - b.position),
        [data?.documents]
    );

    // Local optimistic state for drag & drop
    const [localItems, setLocalItems] = useState<PopulatedChecklistItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    // Sync local items with server items when they change (only if not dragging)
    useEffect(() => {
        if (!isDragging) {
            setLocalItems(serverItems);
        }
    }, [serverItems, isDragging]);

    // Use local items for rendering (optimistic)
    const items = localItems.length > 0 ? localItems : serverItems;

    const progress = useMemo(() => {
        const total = items.length;
        const completed = items.filter(item => item.completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, percentage };
    }, [items]);

    // Focus input when it becomes visible
    useEffect(() => {
        if (isInputVisible && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isInputVisible]);

    const handleAddItem = () => {
        if (!newItemTitle.trim()) return;

        const lastPosition = items.length > 0
            ? items[items.length - 1].position
            : 0;

        const title = newItemTitle.trim();
        const isFirstItem = items.length === 0 && !hasCreatedItem;

        // Clear input immediately for better UX
        setNewItemTitle('');
        setHasCreatedItem(true);

        createItem({
            json: {
                taskId,
                workspaceId,
                title,
                position: lastPosition + POSITION_GAP,
                // Send checklistTitle only on first item creation
                ...(isFirstItem && checklistTitle.trim() ? { checklistTitle: checklistTitle.trim() } : {}),
            }
        });

        // Keep focus on input after adding - use requestAnimationFrame for better timing
        requestAnimationFrame(() => {
            inputRef.current?.focus();
        });
    };

    const handleInputBlur = () => {
        // Close input if empty
        if (!newItemTitle.trim()) {
            setIsInputVisible(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddItem();
        } else if (e.key === 'Escape') {
            setNewItemTitle('');
            setIsInputVisible(false);
            if (!hasCreatedItem && items.length === 0) {
                setIsCreatingChecklist(false);
            }
        }
    };

    const handleDragEnd = useCallback((result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) {
            setIsDragging(false);
            return;
        }
        if (destination.index === source.index) {
            setIsDragging(false);
            return;
        }

        // Create reordered array for optimistic update
        const reorderedItems = Array.from(items);
        const [movedItem] = reorderedItems.splice(source.index, 1);
        reorderedItems.splice(destination.index, 0, movedItem);

        // Calculate new position
        const before = destination.index > 0 ? reorderedItems[destination.index - 1].position : null;
        const after = destination.index < reorderedItems.length - 1 ? reorderedItems[destination.index + 1].position : null;
        const newPosition = calculatePosition(before, after);

        // Optimistically update local state immediately
        const optimisticItems = reorderedItems.map((item) => {
            if (item.$id === draggableId) {
                return { ...item, position: newPosition };
            }
            return item;
        });
        setLocalItems(optimisticItems);

        // Then send update to server
        updateItem({
            param: { itemId: draggableId },
            json: { position: newPosition }
        }, {
            onSettled: () => {
                // Allow sync with server again after mutation completes
                setIsDragging(false);
            }
        });
    }, [items, updateItem]);

    const handleDragStart = useCallback(() => {
        setIsDragging(true);
    }, []);

    const handleAssigneeAdd = useCallback((itemId: string, memberId: string) => {
        addAssignee({
            json: {
                itemId,
                workspaceId,
                workspaceMemberId: memberId
            }
        });
    }, [addAssignee, workspaceId]);

    const handleAssigneeRemove = useCallback((itemId: string, memberId: string) => {
        removeAssignee({ itemId, workspaceMemberId: memberId });
    }, [removeAssignee]);

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (checklistTitle.trim()) {
                setIsAddingItems(true);
            }
        } else if (e.key === 'Escape') {
            setChecklistTitle('');
            setIsCreatingChecklist(false);
        }
    };

    // No checklist yet - show add button
    if (!hasChecklist && !isCreatingChecklist) {
        if (readOnly) return null;

        return (
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreatingChecklist(true)}
                className="text-muted-foreground hover:text-foreground"
            >
                <ListChecks className="size-4 mr-2" />
                {t('add-checklist')}
            </Button>
        );
    }

    // Creating new checklist - Step 1: Enter title
    if (isCreatingChecklist && !isAddingItems && !hasCreatedItem && items.length === 0) {
        return (
            <div className="space-y-3 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ListChecks className="size-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{t('new-checklist')}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => {
                            setIsCreatingChecklist(false);
                            setChecklistTitle('');
                        }}
                    >
                        <X className="size-4" />
                    </Button>
                </div>

                <div className="space-y-2">
                    <Input
                        value={checklistTitle}
                        onChange={(e) => setChecklistTitle(e.target.value)}
                        onKeyDown={handleTitleKeyDown}
                        placeholder={t('checklist-title-placeholder')}
                        autoFocus
                        className="h-9 font-medium"
                    />
                    <Button
                        size="sm"
                        onClick={() => setIsAddingItems(true)}
                        disabled={!checklistTitle.trim()}
                        className="w-full"
                    >
                        {t('continue')}
                    </Button>
                </div>
            </div>
        );
    }

    // Creating new checklist - Step 2: Add items
    if (isCreatingChecklist && isAddingItems && !hasCreatedItem && items.length === 0) {
        return (
            <div className="space-y-3 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ListChecks className="size-5 text-muted-foreground" />
                        <h3 className="text-base font-semibold">{checklistTitle}</h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => {
                            setIsCreatingChecklist(false);
                            setIsAddingItems(false);
                            setChecklistTitle('');
                        }}
                    >
                        <X className="size-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Input
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('checklist-item-placeholder')}
                        disabled={isCreating}
                        autoFocus
                        className="h-9"
                    />
                    <Button
                        size="sm"
                        onClick={handleAddItem}
                        disabled={!newItemTitle.trim() || isCreating}
                    >
                        {t('add')}
                    </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                    {t('checklist-add-first-item-hint')}
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-10 bg-muted rounded animate-pulse" />
                <div className="h-10 bg-muted rounded animate-pulse" />
            </div>
        );
    }

    // Full checklist view
    // Use saved title from task, then local state, then fallback to translation
    const displayTitle = savedChecklistTitle || checklistTitle.trim() || t('checklist');

    const handleTitleSave = (newTitle: string) => {
        if (newTitle.trim() && newTitle !== displayTitle && onTitleChange) {
            onTitleChange(newTitle.trim());
        }
    };

    return (
        <div className="space-y-4">
            {/* Header with progress */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ListChecks className="size-5 text-muted-foreground flex-shrink-0" />
                    {!readOnly && onTitleChange ? (
                        <EditableText
                            value={displayTitle}
                            onSave={handleTitleSave}
                            size="md"
                            className="font-semibold !py-0 !px-1 !min-h-0"
                            inputClassName="!py-0 !px-1 text-base"
                        />
                    ) : (
                        <h3 className="text-base font-semibold">{displayTitle}</h3>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            {progress.total > 0 && <ChecklistProgress progress={progress} />}

            {/* Items list with drag and drop */}
            {items.length > 0 && (
                <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <Droppable
                        droppableId="checklist-items"
                        type="CHECKLIST_ITEM"
                        direction="vertical"
                        isDropDisabled={readOnly}
                    >
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-1"
                            >
                                {items.map((item, index) => (
                                    <Draggable
                                        key={item.$id}
                                        draggableId={item.$id}
                                        index={index}
                                        isDragDisabled={readOnly}
                                    >
                                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
                                            const child = (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={snapshot.isDragging ? "bg-background shadow-lg rounded-lg ring-2 ring-primary/20" : ""}
                                                >
                                                    <ChecklistItemRow
                                                        item={item}
                                                        taskId={taskId}
                                                        workspaceId={workspaceId}
                                                        members={members}
                                                        onAssigneeAdd={handleAssigneeAdd}
                                                        onAssigneeRemove={handleAssigneeRemove}
                                                        readOnly={readOnly || snapshot.isDragging}
                                                    />
                                                </div>
                                            );

                                            // Use portal when dragging to fix transform issues in modals
                                            if (snapshot.isDragging) {
                                                return <DraggablePortal>{child}</DraggablePortal>;
                                            }

                                            return child;
                                        }}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}

            {/* Add new item inline */}
            {!readOnly && (
                isInputVisible ? (
                    <div className="flex items-center gap-2">
                        <Input
                            ref={inputRef}
                            value={newItemTitle}
                            onChange={(e) => setNewItemTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleInputBlur}
                            placeholder={t('checklist-item-placeholder')}
                            className="h-9"
                        />
                        <Button
                            size="sm"
                            onClick={handleAddItem}
                            disabled={!newItemTitle.trim()}
                            className="h-9"
                        >
                            <Plus className="size-4" />
                            {t('add-item')}
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsInputVisible(true)}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Plus className="size-4 mr-2" />
                        {t('add-item')}
                    </Button>
                )
            )}
        </div>
    );
};
