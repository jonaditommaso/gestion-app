import { useCallback, useEffect, useState } from "react";
import { Task, TaskStatus } from "../types";
import {
    DragDropContext,
    Droppable,
    Draggable,
    type DropResult
} from '@hello-pangea/dnd'
import KanbanColumnHeader from "./KanbanColumnHeader";
import KanbanCard from "./KanbanCard";
import { WorkspaceConfigKey, STATUS_TO_LIMIT_KEYS, ColumnLimitType, STATUS_TO_PROTECTED_KEY, STATUS_TO_LABEL_KEY } from "@/app/workspaces/constants/workspace-config-keys";
import { cn } from "@/lib/utils";
import { useWorkspaceConfig } from "@/app/workspaces/hooks/use-workspace-config";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useCurrent } from "@/features/auth/api/use-current";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useUpdateWorkspace } from "@/features/workspaces/api/use-update-workspace";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";

interface DataKanbanProps {
    data: Task[],
    addTask: (status: TaskStatus) => void,
    onChangeTasks: (tasks: { $id: string, status: TaskStatus, position: number }[]) => void;
    openSettings: () => void;
}

const boards: TaskStatus[] = [
    TaskStatus.BACKLOG,
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE,
]

type TasksState = {
    [key in TaskStatus]: Task[]
}

const DataKanban = ({ data, addTask, onChangeTasks, openSettings }: DataKanbanProps) => {
    const config = useWorkspaceConfig();
    const t = useTranslations('workspaces');
    const { data: user } = useCurrent();
    const workspaceId = useWorkspaceId();
    const { mutate: updateWorkspace } = useUpdateWorkspace();
    const { data: workspaces } = useGetWorkspaces();

    // Check if user is ADMIN at organization level
    const isAdmin = user?.prefs?.role === 'ADMIN';

    const handleUpdateLabel = (status: TaskStatus, label: string) => {
        const labelKey = STATUS_TO_LABEL_KEY[status];

        // Get current workspace metadata (only user-modified values)
        const currentWorkspace = workspaces?.documents.find(ws => ws.$id === workspaceId);
        const existingMetadata = currentWorkspace?.metadata
            ? (typeof currentWorkspace.metadata === 'string'
                ? JSON.parse(currentWorkspace.metadata)
                : currentWorkspace.metadata)
            : {};

        // Only update the specific label key
        const newMetadata = {
            ...existingMetadata,
            [labelKey]: label || null, // null if empty to use default
        };

        updateWorkspace({
            param: { workspaceId },
            json: { metadata: JSON.stringify(newMetadata) }
        });
    };

    const [tasks, setTasks] = useState<TasksState>(() => {
        const initialTasks: TasksState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        }

        data.forEach(task => {
            initialTasks[task.status].push(task)
        })

        Object.keys(initialTasks).forEach(status => {
            initialTasks[status as TaskStatus].sort((a, b) => a.position - b.position)
        })

        return initialTasks
    });

    useEffect(() => {
        const newTasks: TasksState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        }

        data.forEach(task => {
            newTasks[task.status].push(task)
        })

        Object.keys(newTasks).forEach(status => {
            newTasks[status as TaskStatus].sort((a, b) => a.position - b.position)
        })

        setTasks(newTasks)

    }, [data])


    const onDragEnd = useCallback((result: DropResult) => {
        if(!result.destination) return;

        const { source, destination } = result;

        const sourceStatus = source.droppableId as TaskStatus;
        const destStatus = destination.droppableId as TaskStatus;

        // Check if destination column is protected and user is not admin
        if (sourceStatus !== destStatus && !isAdmin) {
            const protectedKey = STATUS_TO_PROTECTED_KEY[destStatus];
            const isProtected = config[protectedKey] as boolean;

            if (isProtected) {
                const toastId = toast.info(t('protected-column'), {
                    description: (
                        <div className="flex flex-col gap-2">
                            <p>{t('protected-column-description')}</p>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                    toast.dismiss(toastId);
                                    openSettings();
                                }}
                                className="w-fit"
                            >
                                {t('go-to-settings')}
                            </Button>
                        </div>
                    ),
                    duration: 5000,
                });
                return; // Prevent the drag
            }
        }

        // Check if destination column has a rigid limit and would be exceeded
        if (sourceStatus !== destStatus) {
            const limitKeys = STATUS_TO_LIMIT_KEYS[destStatus];
            const limitType = config[limitKeys.type] as ColumnLimitType;
            const limitMax = config[limitKeys.max] as number | null;
            const currentTaskCount = tasks[destStatus].length;

            if (limitType === ColumnLimitType.RIGID && limitMax !== null && currentTaskCount >= limitMax) {
                // Show toast with custom layout (button below description)
                const toastId = toast.info(t('column-limit-reached'), {
                    description: (
                        <div className="flex flex-col gap-2">
                            <p>{t('column-limit-reached-description', { limit: limitMax })}</p>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                    toast.dismiss(toastId);
                                    openSettings();
                                }}
                                className="w-fit"
                            >
                                {t('go-to-settings')}
                            </Button>
                        </div>
                    ),
                    duration: 5000,
                });
                return; // Prevent the drag
            }
        }

        const updatesPayload: { $id: string, status: TaskStatus, position: number }[] = []

        setTasks(prevTaks => {
            const newTasks = {...prevTaks}

            const sourceColumn = [...newTasks[sourceStatus]];
            const [movedTask] = sourceColumn.splice(source.index, 1)

            if (!movedTask) {
                console.error('No task found at the source index')
                return prevTaks
            }

            const updatedMovedTask = sourceStatus !== destStatus
                ? {...movedTask, status: destStatus}
                : movedTask

            newTasks[sourceStatus] = sourceColumn;

            const destColumn = [...newTasks[destStatus]];
            destColumn.splice(destination.index, 0, updatedMovedTask);

            newTasks[destStatus] = destColumn;

            updatesPayload.push({
                $id: updatedMovedTask.$id,
                status: destStatus,
                position: Math.min((destination.index + 1) * 1000, 1_000_000)
            })

            newTasks[destStatus].forEach((task, index) => {
                if (task && task.$id !== updatedMovedTask.$id) {
                    const newPosition = Math.min((index + 1) * 1000, 1_000_000)
                    if (task.position !== newPosition) {
                        updatesPayload.push({
                            $id: task.$id,
                            status: destStatus,
                            position: newPosition
                        })
                    }
                }
            })

            if (sourceStatus !== destStatus) {
                newTasks[sourceStatus].forEach((task, index) => {
                    if (task) {
                        const newPosition = Math.min((index + 1) * 1000, 1_000_000)
                        if (task.position !== newPosition) {
                            updatesPayload.push({
                                $id: task.$id,
                                status: sourceStatus,
                                position: newPosition
                            })
                        }
                    }
                })
            }

            return newTasks
        })

        onChangeTasks(updatesPayload)
    }, [onChangeTasks, config, t, tasks, openSettings, isAdmin])

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex overflow-x-auto h-full p-[2px]">
                {boards.map(board => {
                    const limitKeys = STATUS_TO_LIMIT_KEYS[board];
                    const limitType = config[limitKeys.type] as ColumnLimitType;
                    const limitMax = config[limitKeys.max] as number | null;
                    const taskCount = tasks[board].length;

                    // Determine if limit is exceeded (only when it goes OVER the limit)
                    const isLimitExceeded = limitType !== ColumnLimitType.NO && limitMax !== null && taskCount > limitMax;
                    const isFlexibleWarning = limitType === ColumnLimitType.FLEXIBLE && isLimitExceeded;

                    return (
                        <div
                            key={board}
                            className="flex-1 mx-2 min-w-[200px] flex flex-col h-full"
                        >
                            <div
                                className={cn(
                                    "bg-muted p-1.5 rounded-md flex flex-col h-full",
                                    isFlexibleWarning && "ring-2 ring-red-500 bg-red-100/50 dark:bg-red-800/20"
                                )}
                            >
                                <KanbanColumnHeader
                                    board={board}
                                    taskCount={taskCount}
                                    addTask={() => addTask(board)}
                                    showCount={config[WorkspaceConfigKey.SHOW_CARD_COUNT]}
                                    onUpdateLabel={handleUpdateLabel}
                                />
                                <Droppable droppableId={board}>
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="flex-1 py-1.5 overflow-y-auto"
                                        >
                                            {tasks[board].map((task, index) => (
                                                <Draggable key={task.$id} draggableId={task.$id} index={index}>
                                                    {provided => (
                                                        <div
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            ref={provided.innerRef}
                                                        >
                                                            <KanbanCard task={task} />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}

                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        </div>
                    )
                })}
            </div>
        </DragDropContext>
    );
}

export default DataKanban;