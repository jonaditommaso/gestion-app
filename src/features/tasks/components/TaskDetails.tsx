'use client'
import { Task, TaskStatus, TaskComment } from "../types";
import { useState, useMemo, useEffect, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TASK_PRIORITY_OPTIONS } from "../constants/priority";
import { TASK_TYPE_OPTIONS } from "../constants/type";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import { format, formatDistanceToNow } from "date-fns";
import { es, enUS, it } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { useCurrent } from "@/features/auth/api/use-current";
import { Button } from "@/components/ui/button";
import RichTextArea from "@/components/RichTextArea";
import { useUpdateTask } from "../api/use-update-task";
import CustomDatePicker from "@/components/CustomDatePicker";
import { cn } from "@/lib/utils";
import { useUploadTaskImage } from "../api/use-upload-task-image";
import { getImageIds, stringifyTaskMetadata } from "../utils/metadata-helpers";
import { useHandleImageUpload } from "../hooks/useHandleImageUpload";
import { processDescriptionImages } from "../utils/processDescriptionImages";
import { checkEmptyContent } from "@/utils/checkEmptyContent";
import { Skeleton } from "@/components/ui/skeleton";
import { useImageDescriptionLoading } from "../hooks/useImageDescriptionLoading";
import { TaskAssigneesManager } from "./TaskAssigneesManager";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useCustomStatuses } from "@/app/workspaces/hooks/use-custom-statuses";
import { useWorkspacePermissions } from "@/app/workspaces/hooks/use-workspace-permissions";
import { LabelSelector } from "./LabelSelector";
import { useGetTasks } from "../api/use-get-tasks";
import { useWorkspaceConfig } from "@/app/workspaces/hooks/use-workspace-config";
import { STATUS_TO_LIMIT_KEYS, STATUS_TO_LABEL_KEY, ColumnLimitType } from "@/app/workspaces/constants/workspace-config-keys";
import { Checklist } from "@/features/checklist";
import { EpicSubtasks } from "./epic-subtasks";
import { useGetTaskComments, useCreateTaskComment, useUpdateTaskComment, useDeleteTaskComment } from "../api/comments";
import { useGetTask } from "../api/use-get-task";
import { Pencil, Trash2, MessageSquare, History, MoreHorizontal, X, CircleCheckBig, Layers } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TaskActivityHistory } from "./TaskActivityHistory";

const DESCRIPTION_PROSE_CLASS = "prose prose-sm max-w-none dark:prose-invert [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6";

interface TaskDetailsProps {
    task: Task;
    readOnly?: boolean;
}

export const TaskTitleEditor = ({
    taskId,
    initialTitle,
    initialType,
    size = 'modal',
    readOnly = false
}: {
    taskId: string;
    initialTitle: string;
    initialType?: string;
    size?: 'modal' | 'page';
    readOnly?: boolean;
}) => {
    const t = useTranslations('workspaces');
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(initialTitle);
    const { mutate: updateTask, isPending } = useUpdateTask();

    const currentType = initialType || 'task';
    const typeOption = TASK_TYPE_OPTIONS.find(t => t.value === currentType)!;
    const TypeIcon = typeOption.icon;

    const handleSave = () => {
        if (readOnly) return;
        if (title.trim() && title !== initialTitle) {
            updateTask({
                json: { name: title.trim() },
                param: { taskId }
            }, {
                onSuccess: () => {
                    setIsEditing(false);
                }
            });
        } else {
            setIsEditing(false);
            setTitle(initialTitle);
        }
    };

    const handleTypeChange = (type: string) => {
        if (readOnly) return;
        updateTask({
            json: { type },
            param: { taskId }
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            setTitle(initialTitle);
            setIsEditing(false);
        }
    };

    const textSize = size === 'page' ? 'text-3xl' : 'text-2xl';
    const iconSize = size === 'page' ? 'size-8' : 'size-6';
    const TitleTag = size === 'page' ? 'h1' : 'h2';

    return (
        <div className="flex-1 flex items-center gap-x-3">
            {readOnly ? (
                <div className="p-1">
                    <TypeIcon className={cn(iconSize, typeOption.textColor)} />
                </div>
            ) : (
                <Select value={currentType} onValueChange={handleTypeChange} disabled={isPending}>
                    <SelectTrigger className="w-fit h-fit border-0 shadow-none bg-transparent hover:bg-muted rounded p-1 focus:ring-0 focus:ring-offset-0 [&>svg:nth-child(2)]:hidden">
                        <TypeIcon className={cn(iconSize, typeOption.textColor)} />
                    </SelectTrigger>
                    <SelectContent>
                        {TASK_TYPE_OPTIONS.map(type => {
                            const Icon = type.icon;
                            return (
                                <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-x-2">
                                        <Icon className={cn("size-4", type.textColor)} />
                                        {t(type.translationKey)}
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            )}
            <div className="flex-1">
                {!readOnly && isEditing ? (
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        disabled={isPending}
                        className={`w-full ${textSize} font-bold bg-transparent border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring`}
                        autoFocus
                    />
                ) : (
                    <TitleTag
                        className={cn(
                            `w-full ${textSize} font-bold rounded px-2 py-1 transition border border-transparent`,
                            !readOnly && "cursor-pointer hover:bg-muted/50"
                        )}
                        onClick={readOnly ? undefined : () => setIsEditing(true)}
                    >
                        {title}
                    </TitleTag>
                )}
            </div>
        </div>
    );
};

const DATE_LOCALES = { es, en: enUS, it };

const TaskDetails = ({ task, readOnly = false }: TaskDetailsProps) => {
    const t = useTranslations('workspaces');
    const locale = useLocale() as 'es' | 'en' | 'it';
    const { data: user } = useCurrent();
    const workspaceId = useWorkspaceId();
    const { data: membersData } = useGetMembers({ workspaceId });
    const { canEditLabel } = useWorkspacePermissions();

    // State for managing the current task being viewed
    const [currentTaskId, setCurrentTaskId] = useState<string>(task.$id);
    const [isLoadingTask, setIsLoadingTask] = useState(false);

    // Fetch the current task (could be different from the initial prop if user navigated)
    const { data: fetchedTask, isLoading: isFetchingTask } = useGetTask({
        taskId: currentTaskId,
        enabled: currentTaskId !== task.$id
    });

    // Use fetched task if available, otherwise use the prop
    const displayTask = fetchedTask || task;
    const isTaskLoading = isLoadingTask || isFetchingTask;

    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [description, setDescription] = useState(displayTask.description || '');
    const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
    const [isAddingComment, setIsAddingComment] = useState(false);
    const [comment, setComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');
    const { pendingImages, setPendingImages, handleImageUpload } = useHandleImageUpload();
    const { imagesLoaded, imagesLoadedCache, descriptionHasImage, descriptionContainerRef } = useImageDescriptionLoading(task, isEditingDescription);

    const { mutate: updateTask, isPending } = useUpdateTask();
    const { mutateAsync: uploadTaskImage } = useUploadTaskImage();
    const { allStatuses, getIconComponent } = useCustomStatuses();
    const config = useWorkspaceConfig();
    const { data: tasksData } = useGetTasks({ workspaceId });
    const [optimisticCompleted, setOptimisticCompleted] = useState<boolean | null>(null);
    const prevCompletedAt = useRef(displayTask.completedAt);

    // Fetch parent epic task if this task has a parentId
    const { data: parentTask } = useGetTask({
        taskId: displayTask.parentId || '',
        enabled: !!displayTask.parentId
    });

    // Update description when displayTask changes
    useEffect(() => {
        setDescription(displayTask.description || '');
        setIsEditingDescription(false);
    }, [displayTask.$id, displayTask.description]);

    // Reset optimistic state when server value changes
    useEffect(() => {
        if (displayTask.completedAt !== prevCompletedAt.current) {
            prevCompletedAt.current = displayTask.completedAt;
            setOptimisticCompleted(null);
        }
    }, [displayTask.completedAt]);

    // Get current member for comment authorship check (moved before hooks that need it)
    const currentMember = useMemo(() => {
        return membersData?.documents?.find(m => m.userId === user?.$id);
    }, [membersData?.documents, user?.$id]);

    // Comments hooks with optimistic updates
    const { data: commentsData, isLoading: isLoadingComments } = useGetTaskComments({ taskId: displayTask.$id });
    const { mutate: createComment } = useCreateTaskComment(
        currentMember ? { $id: currentMember.$id, name: currentMember.name, email: currentMember.email } : undefined
    );
    const { mutate: updateComment } = useUpdateTaskComment(displayTask.$id);
    const { mutate: deleteComment } = useDeleteTaskComment(displayTask.$id);

    const comments = (commentsData?.documents || []) as TaskComment[];

    const availableMembers = ((membersData?.documents || []) as Task['assignees']) || [];

    // Obtener el valor efectivo del status para el selector
    const effectiveStatusValue = displayTask.status === TaskStatus.CUSTOM && displayTask.statusCustomId
        ? displayTask.statusCustomId
        : displayTask.status;

    // Calculate which statuses have reached their rigid limit
    const statusesWithRigidLimitReached = useMemo(() => {
        const blocked = new Set<string>();
        const tasks = tasksData?.documents || [];

        Object.keys(STATUS_TO_LIMIT_KEYS).forEach(statusId => {
            const limitKeys = STATUS_TO_LIMIT_KEYS[statusId];
            const limitType = config[limitKeys.type] as ColumnLimitType;
            const limitMax = config[limitKeys.max] as number | null;

            // Count tasks in this status
            const taskCount = tasks.filter(t => {
                if (statusId === 'CUSTOM') return false;
                return t.status === statusId ||
                    (t.status === TaskStatus.CUSTOM && t.statusCustomId === statusId);
            }).length;

            // Check if rigid limit is reached (don't block current status)
            if (limitType === ColumnLimitType.RIGID && limitMax !== null && taskCount >= limitMax) {
                // Don't block the current status (user can stay where they are)
                if (statusId !== effectiveStatusValue) {
                    blocked.add(statusId);
                }
            }
        });

        return blocked;
    }, [tasksData?.documents, config, effectiveStatusValue]);

    // Encontrar el status actual fuera del render para evitar setState durante render
    const currentStatusData = useMemo(() => {
        return allStatuses.find(s => s.id === effectiveStatusValue);
    }, [allStatuses, effectiveStatusValue]);

    // Helper to get status display name considering custom labels
    const getStatusDisplayName = (status: { id: string; label: string; isDefault?: boolean; translationKey?: string }) => {
        // For custom statuses, always use their label
        if (!status.isDefault) {
            return status.label;
        }
        // For default statuses, check if there's a custom label in config
        const labelKey = STATUS_TO_LABEL_KEY[status.id];
        const customLabel = labelKey ? config[labelKey] as string | null : null;
        // Use custom label if exists, otherwise use translation
        return customLabel || (status.translationKey ? t(status.translationKey) : status.label);
    };

    const handleStatusChange = (statusValue: string) => {
        if (readOnly) return;
        // Detectar si es un custom status
        const isCustomStatus = statusValue.startsWith('CUSTOM_');
        const finalStatus = isCustomStatus ? TaskStatus.CUSTOM : statusValue;
        const statusCustomId = isCustomStatus ? statusValue : null;

        updateTask({
            json: {
                status: finalStatus as Task['status'],
                statusCustomId
            },
            param: { taskId: displayTask.$id }
        });
    };

    const handlePriorityChange = (priority: string) => {
        if (readOnly) return;
        updateTask({
            json: { priority: parseInt(priority) },
            param: { taskId: displayTask.$id }
        });
    };

    const handleDueDateChange = (date: Date | undefined) => {
        if (readOnly) return;
        updateTask({
            json: { dueDate: date ?? null },
            param: { taskId: displayTask.$id }
        });
    };

    const handleLabelChange = (labelId: string | undefined) => {
        if (readOnly) return;
        updateTask({
            json: { label: labelId || null },
            param: { taskId: displayTask.$id }
        });
    };

    const handleSaveDescription = async () => {
        if (readOnly) return;
        // Procesar imágenes en la descripción si existen
        let processedDescription = description;
        const currentImageIds = getImageIds(displayTask);
        const imageIds: string[] = [...currentImageIds];

        if (description && pendingImages.size > 0) {
            const result = await processDescriptionImages(description, pendingImages, uploadTaskImage);
            processedDescription = result.html;
            imageIds.push(...result.imageIds);
        }

        updateTask({
            json: {
                description: checkEmptyContent(processedDescription) ? null : processedDescription,
                metadata: imageIds.length > 0 ? stringifyTaskMetadata({ imageIds }) : undefined
            },
            param: { taskId: displayTask.$id }
        }, {
            onSuccess: () => {
                setIsEditingDescription(false);
                setPendingImages(new Map());
            }
        });
    };

    const handleToggleComplete = () => {
        if (readOnly) return;
        const currentCompleted = optimisticCompleted !== null ? optimisticCompleted : !!displayTask.completedAt;
        const newCompletedState = !currentCompleted;
        // Update optimistically
        setOptimisticCompleted(newCompletedState);
        const newCompletedAt = newCompletedState ? new Date().toISOString() : null;
        updateTask({
            json: { completedAt: newCompletedAt as unknown as Date },
            param: { taskId: displayTask.$id }
        });
    };

    const handleNavigateToParent = () => {
        if (parentTask) {
            setIsLoadingTask(true);
            setCurrentTaskId(parentTask.$id);
            // Reset states
            setIsEditingDescription(false);
            setActiveTab('comments');
            setIsAddingComment(false);
            setComment('');
            setEditingCommentId(null);
            setEditingCommentContent('');
            // Loading will be handled by the query
            setTimeout(() => setIsLoadingTask(false), 100);
        }
    };

    const handleNavigateToSubtask = (subtaskId: string) => {
        setIsLoadingTask(true);
        setCurrentTaskId(subtaskId);
        // Reset states
        setIsEditingDescription(false);
        setActiveTab('comments');
        setIsAddingComment(false);
        setComment('');
        setEditingCommentId(null);
        setEditingCommentContent('');
        // Loading will be handled by the query
        setTimeout(() => setIsLoadingTask(false), 100);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
            {isTaskLoading && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            )}
            {/* Main content - 2/3 width */}
            <div className="lg:col-span-2 space-y-8">
                {/* Parent Epic Breadcrumb */}
                {displayTask.parentId && parentTask && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{t('subtask-of')}</span>
                        <button
                            onClick={handleNavigateToParent}
                            disabled={isTaskLoading}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Layers className="size-4 flex-shrink-0" />
                            <span className="truncate">{parentTask.name}</span>
                        </button>
                    </div>
                )}

                {/* Description section */}
                <div>
                    <h3 className="text-base font-semibold mb-2">{t('description')}</h3>

                    {!readOnly && isEditingDescription ? (
                        <div className="space-y-3">
                            <RichTextArea
                                value={description}
                                onChange={setDescription}
                                placeholder={t('add-description')}
                                onImageUpload={handleImageUpload}
                            />
                            <div className="flex items-center gap-x-2">
                                <Button
                                    size="sm"
                                    onClick={handleSaveDescription}
                                    disabled={isPending}
                                >
                                    {t('save')}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditingDescription(false);
                                        setDescription(displayTask.description || '');
                                    }}
                                    disabled={isPending}
                                >
                                    {t('cancel')}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={cn(
                                "p-4 rounded-lg transition-all",
                                !readOnly && "cursor-pointer",
                                displayTask.description
                                    ? (!readOnly && 'hover:bg-muted/30')
                                    : (!readOnly ? 'border bg-muted/30 hover:bg-muted/50' : ''),
                                descriptionHasImage ? "min-h-[400px]" : "min-h-[60px]"
                            )}
                            onClick={readOnly ? undefined : () => setIsEditingDescription(true)}
                        >
                            {descriptionHasImage && !imagesLoaded && !imagesLoadedCache ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-48 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            ) : displayTask.description ? (
                                <div
                                    ref={descriptionContainerRef}
                                    className={DESCRIPTION_PROSE_CLASS}
                                    dangerouslySetInnerHTML={{ __html: displayTask.description }}
                                />
                            ) : (
                                <p className="text-muted-foreground text-sm">
                                    {readOnly ? t('no-description') : t('click-add-description')}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Hidden real content to measure and load images */}
                    {descriptionHasImage && !imagesLoadedCache && displayTask.description && (
                        <div className="hidden">
                            <div ref={descriptionContainerRef} dangerouslySetInnerHTML={{ __html: displayTask.description }} />
                        </div>
                    )}
                </div>

                {/* Checklist section or Epic Subtasks */}
                {displayTask.type === 'epic' ? (
                    <EpicSubtasks
                        epic={displayTask}
                        onNavigate={handleNavigateToSubtask}
                        availableMembers={availableMembers.map(m => ({ $id: m.$id, name: m.name }))}
                        hideProgressBar={config.hideEpicProgressBar}
                    />
                ) : (
                    <Checklist
                        taskId={displayTask.$id}
                        workspaceId={displayTask.workspaceId}
                        members={availableMembers.map(m => ({ $id: m.$id, name: m.name }))}
                        readOnly={readOnly}
                        checklistCount={displayTask.checklistCount || 0}
                        savedChecklistTitle={displayTask.checklistTitle}
                        onTitleChange={(newTitle) => {
                            updateTask({
                                json: { checklistTitle: newTitle },
                                param: { taskId: displayTask.$id }
                            });
                        }}
                    />
                )}

                {/* Activity section with tabs */}
                <div>
                    {/* Subtle tabs */}
                    <div className="flex items-center gap-4 mb-4 border-b">
                        <button
                            onClick={() => setActiveTab('comments')}
                            className={cn(
                                "flex items-center gap-2 pb-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                                activeTab === 'comments'
                                    ? "border-primary text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <MessageSquare className="size-4" />
                            {t('comments')}
                            {comments.length > 0 && (
                                <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                                    {comments.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={cn(
                                "flex items-center gap-2 pb-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                                activeTab === 'history'
                                    ? "border-primary text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <History className="size-4" />
                            {t('history')}
                        </button>
                    </div>

                    {/* Tab content */}
                    {activeTab === 'comments' ? (
                        <div className="space-y-4">
                            {/* Add comment section */}
                            {!readOnly && (
                                isAddingComment ? (
                                    <div className="flex gap-x-3">
                                        <MemberAvatar
                                            name={user?.name || 'User'}
                                            memberId={currentMember?.$id}
                                            className="size-9 flex-shrink-0 mt-1"
                                        />
                                        <div className="flex-1 space-y-3">
                                            <RichTextArea
                                                value={comment}
                                                onChange={setComment}
                                                placeholder={t('write-comment')}
                                                className="min-h-[100px]"
                                            />
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    disabled={!comment.trim() || checkEmptyContent(comment)}
                                                    onClick={() => {
                                                        if (comment.trim() && !checkEmptyContent(comment)) {
                                                            // Close editor immediately for instant UX (optimistic)
                                                            const contentToSave = comment;
                                                            setComment('');
                                                            setIsAddingComment(false);
                                                            createComment({
                                                                json: {
                                                                    taskId: displayTask.$id,
                                                                    content: contentToSave
                                                                }
                                                            });
                                                        }
                                                    }}
                                                >
                                                    {t('save')}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setComment('');
                                                        setIsAddingComment(false);
                                                    }}
                                                >
                                                    {t('cancel')}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="flex gap-x-3 items-center cursor-pointer group"
                                        onClick={() => setIsAddingComment(true)}
                                    >
                                        <MemberAvatar
                                            name={user?.name || 'User'}
                                            memberId={currentMember?.$id}
                                            className="size-9 flex-shrink-0"
                                        />
                                        <div className="flex-1 p-3 rounded-lg border bg-muted/30 group-hover:bg-muted/50 transition-all">
                                            <p className="text-muted-foreground text-sm">
                                                {t('write-comment')}
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}

                            {/* Comments list */}
                            {isLoadingComments && comments.length === 0 ? (
                                <div className="flex gap-x-3">
                                    <Skeleton className="size-9 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-16 w-full" />
                                    </div>
                                </div>
                            ) : comments.length === 0 ? (
                                <p className="text-muted-foreground text-sm p-3 text-center">
                                    {t('no-comments')}
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {comments.map((commentItem) => (
                                        <div key={commentItem.$id} className="flex gap-x-3 group">
                                            <MemberAvatar
                                                name={commentItem.author?.name || 'User'}
                                                memberId={commentItem.authorMemberId}
                                                className="size-9 flex-shrink-0 mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm">
                                                            {commentItem.author?.name || 'Unknown'}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(new Date(commentItem.$createdAt), {
                                                                addSuffix: true,
                                                                locale: DATE_LOCALES[locale] || DATE_LOCALES.en
                                                            })}
                                                        </span>
                                                        {commentItem.$updatedAt !== commentItem.$createdAt && (
                                                            <span className="text-xs text-muted-foreground italic">
                                                                ({t('edited')})
                                                            </span>
                                                        )}
                                                    </div>
                                                    {!readOnly && currentMember?.$id === commentItem.authorMemberId && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="size-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <MoreHorizontal className="size-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setEditingCommentId(commentItem.$id);
                                                                        setEditingCommentContent(commentItem.content);
                                                                    }}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Pencil className="size-4 mr-2" />
                                                                    {t('edit')}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-destructive cursor-pointer"
                                                                    onClick={() => {
                                                                        deleteComment({
                                                                            param: { commentId: commentItem.$id }
                                                                        });
                                                                    }}
                                                                >
                                                                    <Trash2 className="size-4 mr-2" />
                                                                    {t('delete')}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>
                                                {editingCommentId === commentItem.$id ? (
                                                    <div className="mt-2 space-y-3">
                                                        <RichTextArea
                                                            value={editingCommentContent}
                                                            onChange={setEditingCommentContent}
                                                            placeholder={t('write-comment')}
                                                            className="min-h-[80px]"
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                disabled={!editingCommentContent.trim() || checkEmptyContent(editingCommentContent)}
                                                                onClick={() => {
                                                                    if (editingCommentContent.trim() && !checkEmptyContent(editingCommentContent)) {
                                                                        // Close editor immediately for instant UX (optimistic)
                                                                        const contentToSave = editingCommentContent;
                                                                        setEditingCommentId(null);
                                                                        setEditingCommentContent('');
                                                                        updateComment({
                                                                            json: { content: contentToSave },
                                                                            param: { commentId: commentItem.$id }
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                {t('save')}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setEditingCommentId(null);
                                                                    setEditingCommentContent('');
                                                                }}
                                                            >
                                                                {t('cancel')}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={cn(
                                                            "mt-1 p-3 rounded-lg bg-muted/30",
                                                            DESCRIPTION_PROSE_CLASS
                                                        )}
                                                        dangerouslySetInnerHTML={{ __html: commentItem.content }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* History tab - shows activity log */
                        <TaskActivityHistory taskId={displayTask.$id} />
                    )}
                </div>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-6 bg-muted/30 p-4 rounded-lg border border-border/40 h-fit">
                {/* Status */}
                <div>
                    {readOnly ? (
                        <div
                            className="w-fit gap-2 font-semibold text-white rounded-md px-3 py-2 flex items-center"
                            style={{ backgroundColor: currentStatusData?.color || '#6b7280' }}
                        >
                            {currentStatusData && (() => {
                                const IconComponent = getIconComponent(currentStatusData.icon);
                                return IconComponent ? <IconComponent className="size-4" /> : null;
                            })()}
                            <span>
                                {currentStatusData
                                    ? getStatusDisplayName(currentStatusData)
                                    : t('select-status')}
                            </span>
                        </div>
                    ) : (
                        <Select
                            value={effectiveStatusValue}
                            onValueChange={handleStatusChange}
                            disabled={isPending}
                        >
                            <SelectTrigger
                                className="w-fit gap-2 font-semibold text-white"
                                style={{ backgroundColor: currentStatusData?.color || '#6b7280' }}
                            >
                                <div className="flex items-center gap-2">
                                    {currentStatusData && (() => {
                                        const IconComponent = getIconComponent(currentStatusData.icon);
                                        return IconComponent ? <IconComponent className="size-4" /> : null;
                                    })()}
                                    <span>
                                        {currentStatusData
                                            ? getStatusDisplayName(currentStatusData)
                                            : t('select-status')}
                                    </span>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {allStatuses.map(status => {
                                    const IconComponent = getIconComponent(status.icon);
                                    const isBlocked = statusesWithRigidLimitReached.has(status.id);
                                    return (
                                        <SelectItem
                                            key={status.id}
                                            value={status.id}
                                            disabled={isBlocked}
                                            className={cn(isBlocked && "opacity-50")}
                                        >
                                            <div className="flex items-center gap-2">
                                                {IconComponent && <IconComponent className="size-4" style={{ color: status.color }} />}
                                                {getStatusDisplayName(status)}
                                                {isBlocked && (
                                                    <span className="text-xs text-muted-foreground ml-1">
                                                        ({t('limit-reached')})
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                {/* Details Table */}
                <div className="space-y-3">
                    {/* Label */}
                    <div className="flex items-center py-1">
                        <span className="text-xs font-medium text-muted-foreground w-24">
                            {t('label')}
                        </span>
                        <LabelSelector
                            value={displayTask.label || undefined}
                            onChange={handleLabelChange}
                            disabled={isPending}
                            variant="inline"
                            readOnly={readOnly}
                            canEdit={canEditLabel}
                        />
                    </div>

                    {/* Priority */}
                    <div className="flex items-center py-1">
                        <span className="text-xs font-medium text-muted-foreground w-24">
                            {t('priority')}
                        </span>
                        {readOnly ? (
                            (() => {
                                const priorityOption = TASK_PRIORITY_OPTIONS.find(p => p.value === (displayTask.priority || 3));
                                const Icon = priorityOption?.icon;
                                return (
                                    <div className="flex items-center gap-x-2 px-1.5 py-1">
                                        {Icon && <Icon className="size-4" style={{ color: priorityOption?.color }} />}
                                        <span className="text-sm">{priorityOption ? t(priorityOption.translationKey) : '-'}</span>
                                    </div>
                                );
                            })()
                        ) : (
                            <Select
                                value={String(displayTask.priority || 3)}
                                onValueChange={handlePriorityChange}
                                disabled={isPending}
                            >
                                <SelectTrigger className="w-fit border-0 h-auto shadow-none bg-transparent [&>svg]:hidden hover:bg-muted rounded-sm px-1.5 py-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TASK_PRIORITY_OPTIONS.map(priority => {
                                        const Icon = priority.icon;
                                        return (
                                            <SelectItem key={priority.value} value={String(priority.value)}>
                                                <div className="flex items-center gap-x-2">
                                                    <Icon
                                                        className="size-4"
                                                        style={{ color: priority.color }}
                                                    />
                                                    {t(priority.translationKey)}
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Due Date */}
                    <div className="flex items-center py-1">
                        <span className="text-xs font-medium text-muted-foreground w-24">
                            {t('due-date')}
                        </span>
                        <div className="flex items-center gap-1">
                            {readOnly ? (
                                <span className="text-sm px-1.5 py-1">
                                    {displayTask.dueDate ? format(new Date(displayTask.dueDate), 'MMM d, yyyy') : t('not-defined')}
                                </span>
                            ) : (
                                <>
                                    <CustomDatePicker
                                        value={displayTask.dueDate ? new Date(displayTask.dueDate) : undefined}
                                        onChange={handleDueDateChange}
                                        placeholder='not-defined'
                                        className="w-fit border-0 h-auto shadow-none bg-transparent hover:bg-muted rounded-sm px-1.5 py-1"
                                        hideIcon
                                    />
                                    {displayTask.dueDate && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-8"
                                            onClick={() => handleDueDateChange(undefined)}
                                            disabled={isPending}
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Assignees */}
                    <div className="flex items-center py-1">
                        <span className="text-xs font-medium text-muted-foreground w-24">
                            {t('assignees')}
                        </span>
                        <TaskAssigneesManager
                            taskId={displayTask.$id}
                            assignees={displayTask.assignees || []}
                            availableMembers={availableMembers}
                            readOnly={readOnly}
                        />
                    </div>

                    {/* Completed At */}
                    <div className="flex items-center py-1">
                        <span className="text-xs font-medium text-muted-foreground w-24">
                            {t('completed')}
                        </span>
                        <div className="flex items-center gap-1">
                            <CircleCheckBig
                                className={cn(
                                    "size-4 flex-shrink-0 transition-colors",
                                    (optimisticCompleted !== null ? optimisticCompleted : !!displayTask.completedAt)
                                        ? "text-green-600 dark:text-green-400 fill-green-100 dark:fill-green-950/30"
                                        : "text-muted-foreground",
                                    !readOnly && "cursor-pointer hover:text-green-600 dark:hover:text-green-400"
                                )}
                                onClick={!readOnly ? handleToggleComplete : undefined}
                            />
                            {(optimisticCompleted !== null ? optimisticCompleted : !!displayTask.completedAt) ? (
                                <>
                                    <span className="text-sm px-1.5 py-1">
                                        {format(new Date(displayTask.completedAt || new Date()), 'PPP', { locale: DATE_LOCALES[locale] })}
                                    </span>
                                    {!readOnly && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-8"
                                            onClick={handleToggleComplete}
                                            disabled={isPending}
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <span className="text-sm text-muted-foreground px-1.5 py-1">{t('not-completed')}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t pt-6">
                    <div className="text-xs text-muted-foreground space-y-2">
                        <div>
                            <span className="font-medium">{t('created')}:</span>{' '}
                            {format(new Date(displayTask.$createdAt), 'MMM d, yyyy')}
                        </div>
                        <div>
                            <span className="font-medium">{t('updated')}:</span>{' '}
                            {format(new Date(displayTask.$updatedAt), 'MMM d, yyyy')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;
