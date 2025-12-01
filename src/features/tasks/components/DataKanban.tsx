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
import { useCustomStatuses } from "@/app/workspaces/hooks/use-custom-statuses";
import { CustomStatusDialog } from "@/app/workspaces/components/CustomStatusDialog";
import { CustomStatus, WorkspaceMetadata } from "@/app/workspaces/types/custom-status";
import { PlusIcon } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteTask } from "../api/use-delete-task";
import { useBulkUpdateTasks } from "../api/use-bulk-update-tasks";
import { useWorkspacePermissions } from "@/app/workspaces/hooks/use-workspace-permissions";

interface DataKanbanProps {
    data: Task[],
    addTask: (status: TaskStatus, statusCustomId?: string) => void,
    onChangeTasks: (tasks: { $id: string, status: TaskStatus, statusCustomId?: string | null, position: number }[]) => void;
    openSettings: () => void;
}

type TasksState = {
    [key: string]: Task[]
}

type InsertPositionStore = {
    position?: number;
};

const insertPositionStore: InsertPositionStore = {};

const DataKanban = ({ data, addTask, onChangeTasks, openSettings }: DataKanbanProps) => {
    const config = useWorkspaceConfig();
    const t = useTranslations('workspaces');
    const { data: user } = useCurrent();
    const workspaceId = useWorkspaceId();
    const { mutate: updateWorkspace } = useUpdateWorkspace();
    const { data: workspaces } = useGetWorkspaces();
    const { allStatuses } = useCustomStatuses();
    const [isCreateStatusOpen, setIsCreateStatusOpen] = useState(false);
    const [editingStatus, setEditingStatus] = useState<CustomStatus | undefined>(undefined);

    const [ConfirmDeleteDialog, confirmDelete] = useConfirm(
        t('delete-column-confirm-title'),
        t('delete-column-confirm-message'),
        'destructive'
    );

    const { mutate: deleteTask } = useDeleteTask();
    const { mutate: bulkUpdateTasks } = useBulkUpdateTasks();

    // Estado local para el orden de columnas (optimistic update)
    const [localColumnOrder, setLocalColumnOrder] = useState<string[]>([]);

    // Sincronizar el orden local con allStatuses cuando cambie
    useEffect(() => {
        setLocalColumnOrder(allStatuses.map(s => s.id));
    }, [allStatuses]);

    // Usar el orden local para renderizar
    const orderedStatuses = localColumnOrder.length > 0
        ? localColumnOrder.map(id => allStatuses.find(s => s.id === id)).filter(Boolean) as typeof allStatuses
        : allStatuses;

    // Check if user is ADMIN at organization level
    const isAdmin = user?.prefs?.role === 'ADMIN';

    // Get workspace-level permissions
    const { canCreateColumn } = useWorkspacePermissions();

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

    const handleCreateCustomStatus = (statusData: Omit<CustomStatus, 'id' | 'isDefault' | 'position'>) => {
        const currentWorkspace = workspaces?.documents.find(ws => ws.$id === workspaceId);
        const existingMetadata: WorkspaceMetadata = currentWorkspace?.metadata
            ? (typeof currentWorkspace.metadata === 'string'
                ? JSON.parse(currentWorkspace.metadata)
                : currentWorkspace.metadata)
            : {};

        // Obtener la posición donde se hizo click (índice en el array visual)
        const insertAtIndex = insertPositionStore.position ?? allStatuses.length;
        delete insertPositionStore.position; // Limpiar después de usar

        const nextId = `CUSTOM_${Date.now()}`;

        // Calcular la posición decimal para insertar entre dos columnas existentes
        // Si insertamos en índice 2, queremos una posición entre allStatuses[1].position y allStatuses[2].position
        let newPosition: number;

        if (insertAtIndex === 0) {
            // Antes de la primera columna
            newPosition = allStatuses[0].position - 0.5;
        } else if (insertAtIndex >= allStatuses.length) {
            // Después de la última columna
            newPosition = allStatuses[allStatuses.length - 1].position + 1;
        } else {
            // Entre dos columnas: promedio de las posiciones adyacentes
            const prevPosition = allStatuses[insertAtIndex - 1].position;
            const nextPosition = allStatuses[insertAtIndex].position;
            newPosition = (prevPosition + nextPosition) / 2;
        }

        // Crear el nuevo custom status con la posición calculada
        const newCustomStatus: CustomStatus = {
            ...statusData,
            id: nextId,
            isDefault: false,
            position: newPosition,
        };

        // Obtener todos los custom statuses existentes y agregar el nuevo
        const existingCustomStatuses = existingMetadata.customStatuses || [];
        const updatedCustomStatuses = [...existingCustomStatuses, newCustomStatus];

        const newMetadata: WorkspaceMetadata = {
            ...existingMetadata,
            customStatuses: updatedCustomStatuses,
        };

        updateWorkspace({
            param: { workspaceId },
            json: { metadata: JSON.stringify(newMetadata) }
        }, {
            onSuccess: () => {
                toast.success(t('custom-status-created'));
            },
            onError: () => {
                toast.error(t('custom-status-error'));
            }
        });
    };

    const handleEditCustomStatus = (statusData: Omit<CustomStatus, 'id' | 'isDefault' | 'position'>) => {
        if (!editingStatus) return;

        const currentWorkspace = workspaces?.documents.find(ws => ws.$id === workspaceId);
        const existingMetadata: WorkspaceMetadata = currentWorkspace?.metadata
            ? (typeof currentWorkspace.metadata === 'string'
                ? JSON.parse(currentWorkspace.metadata)
                : currentWorkspace.metadata)
            : {};

        if (editingStatus.isDefault) {
            // For default statuses, save overrides in defaultStatusOverrides
            const existingOverrides = existingMetadata.defaultStatusOverrides || {};
            const newOverrides = {
                ...existingOverrides,
                [editingStatus.id]: {
                    label: statusData.label,
                    icon: statusData.icon,
                    color: statusData.color,
                },
            };

            const newMetadata: WorkspaceMetadata = {
                ...existingMetadata,
                defaultStatusOverrides: newOverrides,
            };

            updateWorkspace({
                param: { workspaceId },
                json: { metadata: JSON.stringify(newMetadata) }
            }, {
                onSuccess: () => {
                    toast.success(t('column-updated'));
                    setEditingStatus(undefined);
                },
                onError: () => {
                    toast.error(t('custom-status-error'));
                }
            });
        } else {
            // For custom statuses, update in customStatuses array
            const existingCustomStatuses = existingMetadata.customStatuses || [];
            const updatedCustomStatuses = existingCustomStatuses.map(status => {
                if (status.id === editingStatus.id) {
                    return {
                        ...status,
                        ...statusData,
                    };
                }
                return status;
            });

            const newMetadata: WorkspaceMetadata = {
                ...existingMetadata,
                customStatuses: updatedCustomStatuses,
            };

            updateWorkspace({
                param: { workspaceId },
                json: { metadata: JSON.stringify(newMetadata) }
            }, {
                onSuccess: () => {
                    toast.success(t('column-updated'));
                    setEditingStatus(undefined);
                },
                onError: () => {
                    toast.error(t('custom-status-error'));
                }
            });
        }
    };

    const handleSaveStatus = (statusData: Omit<CustomStatus, 'id' | 'isDefault' | 'position'>) => {
        if (editingStatus) {
            handleEditCustomStatus(statusData);
        } else {
            handleCreateCustomStatus(statusData);
        }
    };

    const handleOpenEditColumn = (status: CustomStatus) => {
        setEditingStatus(status);
        setIsCreateStatusOpen(true);
    };

    const handleMoveAllCards = (sourceStatusId: string, targetStatusId: string) => {
        const tasksToMove = tasks[sourceStatusId] || [];
        if (tasksToMove.length === 0) return;

        // Determinar si el destino es un custom status
        const isTargetCustom = targetStatusId.startsWith('CUSTOM_');
        const targetStatus = isTargetCustom ? TaskStatus.CUSTOM : targetStatusId as TaskStatus;

        // Get current max position in target column
        const targetTasks = tasks[targetStatusId] || [];
        let maxPosition = targetTasks.length > 0
            ? Math.max(...targetTasks.map(t => t.position))
            : 0;

        // Prepare updates: move all tasks to target status with new positions
        const updates = tasksToMove.map(task => {
            maxPosition += 1000;
            return {
                $id: task.$id,
                status: targetStatus,
                statusCustomId: isTargetCustom ? targetStatusId : null,
                position: maxPosition
            };
        });

        // Optimistically update local state
        setTasks(prevTasks => {
            const newTasks = { ...prevTasks };
            // Remove tasks from source
            newTasks[sourceStatusId] = [];
            // Add tasks to target
            newTasks[targetStatusId] = [
                ...(newTasks[targetStatusId] || []),
                ...tasksToMove.map((task, idx) => ({
                    ...task,
                    status: targetStatus,
                    statusCustomId: isTargetCustom ? targetStatusId : undefined,
                    position: updates[idx].position
                }))
            ].sort((a, b) => a.position - b.position);
            return newTasks;
        });

        // Send bulk update to server
        bulkUpdateTasks({
            json: { tasks: updates }
        });
    };

    const handleDeleteColumn = async (statusId: string) => {
        const confirmed = await confirmDelete();
        if (!confirmed) return;

        // Get tasks in this column and delete them
        const tasksInColumn = tasks[statusId] || [];
        for (const task of tasksInColumn) {
            deleteTask({ param: { taskId: task.$id } });
        }

        const currentWorkspace = workspaces?.documents.find(ws => ws.$id === workspaceId);
        const existingMetadata: WorkspaceMetadata = currentWorkspace?.metadata
            ? (typeof currentWorkspace.metadata === 'string'
                ? JSON.parse(currentWorkspace.metadata)
                : currentWorkspace.metadata)
            : {};

        // Check if it's a custom status (starts with CUSTOM_)
        const isCustom = statusId.startsWith('CUSTOM_');

        let newMetadata: WorkspaceMetadata;

        if (isCustom) {
            // For custom statuses: remove completely from customStatuses array
            const existingCustomStatuses = existingMetadata.customStatuses || [];
            const updatedCustomStatuses = existingCustomStatuses.filter(
                status => status.id !== statusId
            );

            // Only include customStatuses if there are still items
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { customStatuses: _removed, ...restMetadata } = existingMetadata;
            newMetadata = {
                ...restMetadata,
                ...(updatedCustomStatuses.length > 0 && { customStatuses: updatedCustomStatuses }),
            };
        } else {
            // For default statuses: add to hiddenStatuses (soft delete)
            const hiddenStatuses = existingMetadata.hiddenStatuses || [];
            const newHiddenStatuses = [...hiddenStatuses, statusId];

            newMetadata = {
                ...existingMetadata,
                hiddenStatuses: newHiddenStatuses,
            };
        }

        updateWorkspace({
            param: { workspaceId },
            json: { metadata: JSON.stringify(newMetadata) }
        }, {
            onSuccess: () => {
                toast.success(t('column-deleted'));
            },
            onError: () => {
                toast.error(t('custom-status-error'));
            }
        });
    };

    // Helper para determinar si un status ID corresponde a un custom status
    const isCustomStatus = useCallback((statusId: string): boolean => {
        return statusId.startsWith('CUSTOM_');
    }, []);

    const [tasks, setTasks] = useState<TasksState>(() => {
        const initialTasks: TasksState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        }

        data.forEach(task => {
            const effectiveStatus = task.status === TaskStatus.CUSTOM && task.statusCustomId
                ? task.statusCustomId
                : task.status;
            if (!initialTasks[effectiveStatus]) {
                initialTasks[effectiveStatus] = [];
            }
            initialTasks[effectiveStatus].push(task)
        })

        Object.keys(initialTasks).forEach(status => {
            initialTasks[status].sort((a, b) => a.position - b.position)
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
            const effectiveStatus = task.status === TaskStatus.CUSTOM && task.statusCustomId
                ? task.statusCustomId
                : task.status;
            if (!newTasks[effectiveStatus]) {
                newTasks[effectiveStatus] = [];
            }
            newTasks[effectiveStatus].push(task)
        })

        Object.keys(newTasks).forEach(status => {
            newTasks[status].sort((a, b) => a.position - b.position)
        })

        setTasks(newTasks)

    }, [data])


    const onDragEnd = useCallback((result: DropResult) => {
        if(!result.destination) return;

        const { source, destination, type } = result;

        // Handle column reordering
        if (type === 'COLUMN') {
            if (!isAdmin) return; // Solo admins pueden reordenar columnas

            const sourceIndex = source.index;
            const destIndex = destination.index;

            if (sourceIndex === destIndex) return;

            // Optimistic update del orden local
            const newOrder = [...localColumnOrder];
            const [movedId] = newOrder.splice(sourceIndex, 1);
            newOrder.splice(destIndex, 0, movedId);
            setLocalColumnOrder(newOrder);

            // Calcular la nueva posición decimal usando orderedStatuses
            let newPosition: number;

            // Crear una copia del array de statuses para calcular posiciones
            const statusesCopy = [...orderedStatuses];
            const [movedStatus] = statusesCopy.splice(sourceIndex, 1);
            statusesCopy.splice(destIndex, 0, movedStatus);

            if (destIndex === 0) {
                // Mover al principio
                newPosition = statusesCopy[1].position - 0.5;
            } else if (destIndex === statusesCopy.length - 1) {
                // Mover al final
                newPosition = statusesCopy[statusesCopy.length - 2].position + 0.5;
            } else {
                // Mover entre dos columnas
                const prevPosition = statusesCopy[destIndex - 1].position;
                const nextPosition = statusesCopy[destIndex + 1].position;
                newPosition = (prevPosition + nextPosition) / 2;
            }

            // Obtener metadata actual
            const currentWorkspace = workspaces?.documents.find(ws => ws.$id === workspaceId);
            const existingMetadata: WorkspaceMetadata = currentWorkspace?.metadata
                ? (typeof currentWorkspace.metadata === 'string'
                    ? JSON.parse(currentWorkspace.metadata)
                    : currentWorkspace.metadata)
                : {};

            const movedStatusObj = orderedStatuses[sourceIndex];

            if (movedStatusObj.isDefault) {
                // Es un status por defecto, guardar su nueva posición en defaultStatusPositions
                const defaultPositions = existingMetadata.defaultStatusPositions || {};
                const newDefaultPositions = {
                    ...defaultPositions,
                    [movedStatusObj.id]: newPosition,
                };

                const newMetadata: WorkspaceMetadata = {
                    ...existingMetadata,
                    defaultStatusPositions: newDefaultPositions,
                };

                updateWorkspace({
                    param: { workspaceId },
                    json: { metadata: JSON.stringify(newMetadata) }
                });
            } else {
                // Es un custom status, actualizar su posición
                const existingCustomStatuses = existingMetadata.customStatuses || [];
                const updatedCustomStatuses = existingCustomStatuses.map(status => {
                    if (status.id === movedStatusObj.id) {
                        return { ...status, position: newPosition };
                    }
                    return status;
                });

                const newMetadata: WorkspaceMetadata = {
                    ...existingMetadata,
                    customStatuses: updatedCustomStatuses,
                };

                updateWorkspace({
                    param: { workspaceId },
                    json: { metadata: JSON.stringify(newMetadata) }
                });
            }

            return;
        }

        // Handle task reordering (existing logic)
        const sourceStatusId = source.droppableId; // Puede ser TaskStatus o CUSTOM_xxx
        const destStatusId = destination.droppableId; // Puede ser TaskStatus o CUSTOM_xxx

        // Determinar el status real para enviar al servidor
        const isSourceCustom = isCustomStatus(sourceStatusId);
        const isDestCustom = isCustomStatus(destStatusId);

        const sourceStatus = isSourceCustom ? TaskStatus.CUSTOM : sourceStatusId as TaskStatus;
        const destStatus = isDestCustom ? TaskStatus.CUSTOM : destStatusId as TaskStatus;

        // Si la task se suelta en la misma posición, no hacer nada
        if (sourceStatusId === destStatusId && source.index === destination.index) {
            return;
        }

        // Check if destination column is protected and user is not admin
        // Solo aplica a columnas default, no custom
        if (sourceStatusId !== destStatusId && !isAdmin && !isDestCustom) {
            const protectedKey = STATUS_TO_PROTECTED_KEY[destStatus];
            const isProtected = protectedKey ? config[protectedKey] as boolean : false;

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
        // Solo aplica a columnas default, no custom
        if (sourceStatusId !== destStatusId && !isDestCustom) {
            const limitKeys = STATUS_TO_LIMIT_KEYS[destStatus];
            if (limitKeys) {
                const limitType = config[limitKeys.type] as ColumnLimitType;
                const limitMax = config[limitKeys.max] as number | null;
                const currentTaskCount = tasks[destStatusId]?.length || 0;

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
        }

        const updatesPayload: { $id: string, status: TaskStatus, statusCustomId?: string | null, position: number }[] = []

        setTasks(prevTasks => {
            const newTasks = {...prevTasks}

            // Usar statusId para acceder a las columnas locales
            const sourceColumn = [...(newTasks[sourceStatusId] || [])];
            const [movedTask] = sourceColumn.splice(source.index, 1)

            if (!movedTask) {
                console.error('No task found at the source index')
                return prevTasks
            }

            // Actualizar la tarea con el nuevo status
            const updatedMovedTask = sourceStatusId !== destStatusId
                ? {
                    ...movedTask,
                    status: destStatus,
                    statusCustomId: isDestCustom ? destStatusId : undefined
                  }
                : movedTask

            newTasks[sourceStatusId] = sourceColumn;

            const destColumn = [...(newTasks[destStatusId] || [])];
            destColumn.splice(destination.index, 0, updatedMovedTask);

            newTasks[destStatusId] = destColumn;

            updatesPayload.push({
                $id: updatedMovedTask.$id,
                status: destStatus,
                statusCustomId: isDestCustom ? destStatusId : null,
                position: Math.min((destination.index + 1) * 1000, 1_000_000)
            })

            newTasks[destStatusId].forEach((task, index) => {
                if (task && task.$id !== updatedMovedTask.$id) {
                    const newPosition = Math.min((index + 1) * 1000, 1_000_000)
                    if (task.position !== newPosition) {
                        updatesPayload.push({
                            $id: task.$id,
                            status: destStatus,
                            statusCustomId: isDestCustom ? destStatusId : null,
                            position: newPosition
                        })
                    }
                }
            })

            if (sourceStatusId !== destStatusId) {
                newTasks[sourceStatusId].forEach((task, index) => {
                    if (task) {
                        const newPosition = Math.min((index + 1) * 1000, 1_000_000)
                        if (task.position !== newPosition) {
                            updatesPayload.push({
                                $id: task.$id,
                                status: sourceStatus,
                                statusCustomId: isSourceCustom ? sourceStatusId : null,
                                position: newPosition
                            })
                        }
                    }
                })
            }

            return newTasks
        })

        onChangeTasks(updatesPayload)
    }, [onChangeTasks, config, t, tasks, openSettings, isAdmin, localColumnOrder, orderedStatuses, updateWorkspace, workspaceId, workspaces?.documents, isCustomStatus])

    // Determinar si necesitamos scroll (más de 5 columnas)
    const needsScroll = orderedStatuses.length > 5;

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="columns" type="COLUMN" direction="horizontal">
                    {(columnsProvided) => (
                        <div
                            className="flex h-full p-[2px] px-4 overflow-x-auto"
                            ref={columnsProvided.innerRef}
                            {...columnsProvided.droppableProps}
                        >
                            {orderedStatuses.map((statusObj, index) => {
                                const board = statusObj.id as TaskStatus;
                                const limitKeys = STATUS_TO_LIMIT_KEYS[board];
                                const limitType = limitKeys ? config[limitKeys.type] as ColumnLimitType : ColumnLimitType.NO;
                                const limitMax = limitKeys ? config[limitKeys.max] as number | null : null;
                                const taskCount = tasks[board]?.length || 0;

                                // Determine if limit is exceeded (only when it goes OVER the limit)
                                const isLimitExceeded = limitType !== ColumnLimitType.NO && limitMax !== null && taskCount > limitMax;
                                const isFlexibleWarning = limitType === ColumnLimitType.FLEXIBLE && isLimitExceeded;
                                // Determine if rigid limit is reached (at or over limit) - blocks adding new tasks
                                const isRigidLimitReached = limitType === ColumnLimitType.RIGID && limitMax !== null && taskCount >= limitMax;

                                return (
                                    <Draggable
                                        key={board}
                                        draggableId={`column-${board}`}
                                        index={index}
                                        isDragDisabled={!isAdmin}
                                    >
                                        {(columnProvided, columnSnapshot) => (
                                            <div
                                                ref={columnProvided.innerRef}
                                                {...columnProvided.draggableProps}
                                                className="flex"
                                                style={{
                                                    ...columnProvided.draggableProps.style,
                                                    flex: needsScroll ? '0 0 280px' : '1 1 auto',
                                                    minWidth: needsScroll ? '280px' : '200px',
                                                    maxWidth: needsScroll ? '280px' : undefined,
                                                }}
                                            >
                                                {/* Add column divider before columns */}
                                                {canCreateColumn && (
                                                    <div className="relative flex-shrink-0 w-0 h-full group z-10" data-insert-position={index}>
                                                        <div className="absolute left-0 top-0 bottom-0 w-4 -ml-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="h-full w-[2px] border-l-2 border-dashed border-muted-foreground/30"></div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="absolute size-7 rounded-full bg-background hover:bg-primary/10 transition-all shadow-md"
                                                                onClick={() => {
                                                                    setIsCreateStatusOpen(true);
                                                                    insertPositionStore.position = index;
                                                                }}
                                                                title={t('add-custom-column')}
                                                            >
                                                                <PlusIcon className="size-4 text-muted-foreground hover:text-primary transition-colors" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div
                                                    className={cn(
                                                        "mx-1 flex flex-col h-full w-full",
                                                        columnSnapshot.isDragging && "opacity-90",
                                                        isAdmin && "cursor-grab active:cursor-grabbing"
                                                    )}
                                                    data-column-index={index}
                                                    {...columnProvided.dragHandleProps}
                                                >
                                                    <div
                                                        className={cn(
                                                            "bg-muted p-1.5 rounded-md flex flex-col h-full",
                                                            isFlexibleWarning && "ring-2 ring-red-500 bg-red-100/50 dark:bg-red-800/20",
                                                            columnSnapshot.isDragging && "ring-2 ring-primary shadow-lg"
                                                        )}
                                                    >
                                                        <KanbanColumnHeader
                                                            board={board}
                                                            taskCount={taskCount}
                                                            addTask={() => {
                                                                // Si es custom status, pasar CUSTOM + el ID
                                                                if (statusObj.id.startsWith('CUSTOM_')) {
                                                                    addTask(TaskStatus.CUSTOM, statusObj.id);
                                                                } else {
                                                                    addTask(board);
                                                                }
                                                            }}
                                                            showCount={config[WorkspaceConfigKey.SHOW_CARD_COUNT]}
                                                            onUpdateLabel={handleUpdateLabel}
                                                            customStatus={statusObj.isDefault ? undefined : statusObj}
                                                            statusInfo={statusObj}
                                                            onEditColumn={() => handleOpenEditColumn(statusObj)}
                                                            onMoveAllCards={(targetStatusId) => handleMoveAllCards(statusObj.id, targetStatusId)}
                                                            onDeleteColumn={() => handleDeleteColumn(statusObj.id)}
                                                            availableStatuses={orderedStatuses}
                                                            isRigidLimitReached={isRigidLimitReached}
                                                        />
                                                        <Droppable droppableId={board} type="TASK">
                                                            {(provided) => (
                                                                <div
                                                                    {...provided.droppableProps}
                                                                    ref={provided.innerRef}
                                                                    className="flex-1 py-1.5 overflow-y-auto"
                                                                >
                                                                    {(tasks[board] || []).map((task, taskIndex) => (
                                                                        <Draggable key={task.$id} draggableId={task.$id} index={taskIndex}>
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

                                                {/* Add column divider after last column */}
                                                {canCreateColumn && index === orderedStatuses.length - 1 && (
                                                    <div className="relative flex-shrink-0 w-0 h-full group z-10" data-insert-position={index + 1}>
                                                        <div className="absolute left-0 top-0 bottom-0 w-4 -ml-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="h-full w-[2px] border-l-2 border-dashed border-muted-foreground/30"></div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="absolute size-7 rounded-full bg-background hover:bg-primary/10 transition-all shadow-md"
                                                                onClick={() => {
                                                                    setIsCreateStatusOpen(true);
                                                                    insertPositionStore.position = index + 1;
                                                                }}
                                                                title={t('add-custom-column')}
                                                            >
                                                                <PlusIcon className="size-4 text-muted-foreground hover:text-primary transition-colors" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                )
                            })}
                            {columnsProvided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <CustomStatusDialog
                open={isCreateStatusOpen}
                onOpenChange={(open) => {
                    setIsCreateStatusOpen(open);
                    if (!open) {
                        // Delay reset to allow dialog close animation to complete
                        setTimeout(() => setEditingStatus(undefined), 200);
                    }
                }}
                onSaveStatus={handleSaveStatus}
                existingStatusCount={allStatuses.length}
                editingStatus={editingStatus}
            />

            <ConfirmDeleteDialog />
        </>
    );
}

export default DataKanban;