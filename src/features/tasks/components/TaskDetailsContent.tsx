'use client'
import { Task } from "../types";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TASK_STATUS_OPTIONS } from "../constants/status";
import { TASK_PRIORITY_OPTIONS } from "../constants/priority";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import RichTextArea from "@/components/RichTextArea";
import { useUpdateTask } from "../api/use-update-task";
import CustomDatePicker from "@/components/CustomDatePicker";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ExternalLinkIcon, MoreHorizontalIcon, TrashIcon, XIcon } from "lucide-react";

interface TaskDetailsContentProps {
    task: Task;
}

const TaskDetailsTitleEditor = ({
    taskId,
    initialTitle
}: {
    taskId: string;
    initialTitle: string;
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(initialTitle);
    const { mutate: updateTask, isPending } = useUpdateTask();

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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            setTitle(initialTitle);
            setIsEditing(false);
        }
    };

    return (
        <div className="flex-1">
            {isEditing ? (
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    disabled={isPending}
                    className="w-full text-2xl font-bold bg-transparent border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                />
            ) : (
                <h2
                    className="w-full text-2xl font-bold cursor-pointer hover:bg-muted/50 rounded px-2 py-1 transition border border-transparent"
                    onClick={() => setIsEditing(true)}
                >
                    {title}
                </h2>
            )}
        </div>
    );
};

const TaskDetailsActions = ({
    onOpenInNewPage,
    onDelete,
    onClose,
    isDeleting
}: {
    onOpenInNewPage: () => void;
    onDelete: () => void;
    onClose: () => void;
    isDeleting: boolean;
}) => {
    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isDeleting}>
                        <MoreHorizontalIcon className="size-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onOpenInNewPage}>
                        <ExternalLinkIcon className="size-4 mr-2" />
                        Open in new page
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-destructive">
                        <TrashIcon className="size-4 mr-2" />
                        Delete task
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={onClose}>
                <XIcon className="size-5" />
            </Button>
        </div>
    );
};

const TaskDetailsContent = ({ task }: TaskDetailsContentProps) => {
    const t = useTranslations('workspaces');
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [description, setDescription] = useState(task.description || '');
    const [isAddingComment, setIsAddingComment] = useState(false);
    const [comment, setComment] = useState('');

    const { mutate: updateTask, isPending } = useUpdateTask();

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

    const handleSaveDescription = () => {
        updateTask({
            json: { description: description || undefined },
            param: { taskId: task.$id }
        }, {
            onSuccess: () => {
                setIsEditingDescription(false);
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
                            className="min-h-[60px] p-4 rounded-lg border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-all"
                            onClick={() => setIsEditingDescription(true)}
                        >
                            {task.description ? (
                                <div
                                    className="prose prose-sm max-w-none dark:prose-invert"
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
            <div className="space-y-6 bg-muted/30 p-4 rounded-lg border border-border/40">
                {/* Status - Keep as select */}
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

TaskDetailsContent.Actions = TaskDetailsActions;
TaskDetailsContent.TitleEditor = TaskDetailsTitleEditor;

export default TaskDetailsContent;
