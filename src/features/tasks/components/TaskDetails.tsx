'use client'
import { Task } from "../types";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TASK_STATUS_OPTIONS } from "../constants/status";
import { TASK_PRIORITY_OPTIONS } from "../constants/priority";
import { TASK_TYPE_OPTIONS } from "../constants/type";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import RichTextArea from "@/components/RichTextArea";
import { useUpdateTask } from "../api/use-update-task";
import CustomDatePicker from "@/components/CustomDatePicker";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useUploadTaskImage } from "../api/use-upload-task-image";
import { getImageIds, stringifyTaskMetadata } from "../utils/metadata-helpers";
import { useHandleImageUpload } from "../hooks/useHandleImageUpload";
import { processDescriptionImages } from "../utils/processDescriptionImages";
import { checkEmptyContent } from "@/utils/checkEmptyContent";

interface TaskDetailsProps {
    task: Task;
}

export const TaskTitleEditor = ({
    taskId,
    initialTitle,
    initialType,
    size = 'modal'
}: {
    taskId: string;
    initialTitle: string;
    initialType?: string;
    size?: 'modal' | 'page';
}) => {
    const t = useTranslations('workspaces');
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(initialTitle);
    const { mutate: updateTask, isPending } = useUpdateTask();

    const currentType = initialType || 'task';
    const typeOption = TASK_TYPE_OPTIONS.find(t => t.value === currentType)!;
    const TypeIcon = typeOption.icon;

    const handleSave = () => {
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
            <div className="flex-1">
                {isEditing ? (
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
                        className={`w-full ${textSize} font-bold cursor-pointer hover:bg-muted/50 rounded px-2 py-1 transition border border-transparent`}
                        onClick={() => setIsEditing(true)}
                    >
                        {title}
                    </TitleTag>
                )}
            </div>
        </div>
    );
};

const TaskDetails = ({ task }: TaskDetailsProps) => {
    const t = useTranslations('workspaces');
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [description, setDescription] = useState(task.description || '');
    const [isAddingComment, setIsAddingComment] = useState(false);
    const [comment, setComment] = useState('');
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [label, setLabel] = useState(task.label || '');
    const { pendingImages, setPendingImages, handleImageUpload } = useHandleImageUpload();

    const { mutate: updateTask, isPending } = useUpdateTask();
    const { mutateAsync: uploadTaskImage } = useUploadTaskImage();

    const handleStatusChange = (status: string) => {
        updateTask({
            json: { status: status as Task['status'] },
            param: { taskId: task.$id }
        });
    };

    const handlePriorityChange = (priority: string) => {
        updateTask({
            json: { priority: parseInt(priority) },
            param: { taskId: task.$id }
        });
    };

    const handleDueDateChange = (date: Date | undefined) => {
        updateTask({
            json: { dueDate: date },
            param: { taskId: task.$id }
        });
    };

    const handleLabelBlur = () => {
        if (label !== task.label) {
            updateTask({
                json: { label: label || undefined },
                param: { taskId: task.$id }
            }, {
                onSuccess: () => {
                    setIsEditingLabel(false);
                }
            });
        } else {
            setIsEditingLabel(false);
        }
    };

    const handleLabelKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleLabelBlur();
        } else if (e.key === 'Escape') {
            setLabel(task.label || '');
            setIsEditingLabel(false);
        }
    };

    const handleSaveDescription = async () => {
        // Procesar imágenes en la descripción si existen
        let processedDescription = description;
        const currentImageIds = getImageIds(task);
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
            param: { taskId: task.$id }
        }, {
            onSuccess: () => {
                setIsEditingDescription(false);
                setPendingImages(new Map());
            }
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
            {/* Main content - 2/3 width */}
            <div className="lg:col-span-2 space-y-8">
                {/* Description section */}
                <div>
                    <h3 className="text-base font-semibold mb-2">Description</h3>

                    {isEditingDescription ? (
                        <div className="space-y-3">
                            <RichTextArea
                                value={description}
                                onChange={setDescription}
                                placeholder="Add a more detailed description..."
                                onImageUpload={handleImageUpload}
                            />
                            <div className="flex items-center gap-x-2">
                                <Button
                                    size="sm"
                                    onClick={handleSaveDescription}
                                    disabled={isPending}
                                >
                                    Save
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditingDescription(false);
                                        setDescription(task.description || '');
                                    }}
                                    disabled={isPending}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={`min-h-[60px] p-4 rounded-lg cursor-pointer transition-all ${
                                task.description
                                    ? 'hover:bg-muted/30'
                                    : 'border bg-muted/30 hover:bg-muted/50'
                            }`}
                            onClick={() => setIsEditingDescription(true)}
                        >
                            {task.description ? (
                                <div
                                    className="prose prose-sm max-w-none dark:prose-invert [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
                                    dangerouslySetInnerHTML={{ __html: task.description }}
                                />
                            ) : (
                                <p className="text-muted-foreground text-sm">Click to add a description...</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Activity section */}
                <div>
                    <h3 className="text-base font-semibold mb-2">Activity</h3>
                    <div className="space-y-4">
                        {isAddingComment ? (
                            <div className="flex gap-x-3">
                                <MemberAvatar
                                    name={task.assignee.name}
                                    className="size-9 flex-shrink-0"
                                />
                                <div className="flex-1 space-y-3">
                                    <textarea
                                        placeholder="Write a comment..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full min-h-[100px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                        autoFocus
                                    />
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                // TODO: Implement save comment
                                                setComment('');
                                                setIsAddingComment(false);
                                            }}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setComment('');
                                                setIsAddingComment(false);
                                            }}
                                        >
                                            Cancel
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
                                    name={task.assignee.name}
                                    className="size-9 flex-shrink-0"
                                />
                                <div className="flex-1 p-3 rounded-lg border bg-muted/30 group-hover:bg-muted/50 transition-all">
                                    <p className="text-muted-foreground text-sm">
                                        Write a comment...
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-6 bg-muted/30 p-4 rounded-lg border border-border/40 h-fit">
                {/* Status */}
                <div>
                    <Select
                        value={task.status}
                        onValueChange={handleStatusChange}
                        disabled={isPending}
                    >
                        <SelectTrigger className={`w-fit gap-2 font-semibold text-white ${TASK_STATUS_OPTIONS.find(s => s.value === task.status)?.solidColor || ''}`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {TASK_STATUS_OPTIONS.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                    {t(status.translationKey)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Details Table */}
                <div className="space-y-3">
                    {/* Label */}
                    <div className="flex items-center py-1">
                        <span className="text-xs font-medium text-muted-foreground w-24">
                            {t('label')}
                        </span>
                        {isEditingLabel ? (
                            <Input
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                onBlur={handleLabelBlur}
                                onKeyDown={handleLabelKeyDown}
                                maxLength={25}
                                placeholder={t('enter-label')}
                                disabled={isPending}
                                className="h-7 text-sm border-0 shadow-none bg-transparent hover:bg-muted rounded-sm px-1.5"
                                autoFocus
                            />
                        ) : (
                            <div
                                onClick={() => setIsEditingLabel(true)}
                                className="cursor-pointer hover:bg-muted rounded-sm px-1.5 py-1 transition-colors"
                            >
                                {task.label ? (
                                    <span className="text-sm">{task.label}</span>
                                ) : (
                                    <span className="text-sm text-muted-foreground">{t('no-label')}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Priority */}
                    <div className="flex items-center py-1">
                        <span className="text-xs font-medium text-muted-foreground w-24">
                            Priority
                        </span>
                        <Select
                            value={String(task.priority || 3)}
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
                    </div>

                    {/* Assignee */}
                    <div className="flex items-center py-1">
                        <span className="text-xs font-medium text-muted-foreground w-24">
                            Assignee
                        </span>
                        <div className="flex items-center gap-x-2">
                            <MemberAvatar
                                name={task.assignee.name}
                                className="size-6"
                            />
                            <span className="text-sm">{task.assignee.name}</span>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="flex items-center py-1">
                        <span className="text-xs font-medium text-muted-foreground w-24">
                            Due Date
                        </span>
                        <div>
                            <CustomDatePicker
                                value={task.dueDate ? new Date(task.dueDate) : undefined}
                                onChange={handleDueDateChange}
                                placeholder="Select date"
                                className="w-fit border-0 h-auto shadow-none bg-transparent hover:bg-muted rounded-sm px-1.5 py-1"
                                hideIcon
                            />
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t pt-6">
                    <div className="text-xs text-muted-foreground space-y-2">
                        <div>
                            <span className="font-medium">Created:</span>{' '}
                            {format(new Date(task.$createdAt), 'MMM d, yyyy')}
                        </div>
                        <div>
                            <span className="font-medium">Updated:</span>{' '}
                            {format(new Date(task.$updatedAt), 'MMM d, yyyy')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;
