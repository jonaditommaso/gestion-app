'use client'
import { DialogContainer } from "@/components/DialogContainer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader, PlusIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import CreateTaskFormWrapper from "./CreateTaskFormWrapper";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useGetTasks } from "../api/use-get-tasks";
import DataFilters from "./DataFilters";
import { useTaskFilters } from "../hooks/use-task-filters";
import { DataTable } from "./DataTable";
import { columns } from "../columns";
import DataKanban from "./DataKanban";
import { Task, TaskStatus } from "../types";
import { useBulkUpdateTasks } from "../api/use-bulk-update-tasks";
import DataCalendar from "./DataCalendar";
import { useTranslations } from "next-intl";
import { useWorkspacePermissions } from "@/app/workspaces/hooks/use-workspace-permissions";
import { useCurrentUserPermissions } from "@/features/roles/hooks/useCurrentUserPermissions";
import { PERMISSIONS } from "@/features/roles/constants";
import { useAppContext } from "@/context/AppContext";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import DataGantt from "./DataGantt";

interface TaskSwitcherProps {
    openSettings: () => void;
}

const TaskSwitcher = ({ openSettings }: TaskSwitcherProps) => {
    const workspaceId = useWorkspaceId();
    const [modalOpen, setModalOpen] = useState(false);
    const [initialStatus, setInitialStatus] = useState<TaskStatus | undefined>(undefined);
    const [initialStatusCustomId, setInitialStatusCustomId] = useState<string | undefined>(undefined);
    const [currentTab, setCurrentTab] = useState('kanban') // I can use useQueryState from nuqs in order to keep the tab selected if I refresh
    const [localSearch, setLocalSearch] = useState('');
    const t = useTranslations('workspaces');
    const { canCreateTask } = useWorkspacePermissions();
    const { hasPermission, hasGranularPermission } = useCurrentUserPermissions();
    const { plan } = usePlanAccess();
    const { isDemo } = useAppContext();
    const canWrite = hasPermission(PERMISSIONS.WRITE);

    const canViewGantt = plan !== 'FREE' && hasGranularPermission('view_gantt_workspaces');

    const [{
        status,
        assigneeId,
        squadId,
        dueDate,
        priority,
        label,
        type,
        completed
    }] = useTaskFilters();

    const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({ workspaceId, status, assigneeId, squadId, dueDate, priority, label, type, completed, enabled: workspaceId !== 'create' });

    // Filtro local por nombre
    const filteredTasks = useMemo(() => {
        if (!tasks?.documents) return [];
        if (!localSearch.trim()) return tasks.documents;

        const searchLower = localSearch.toLowerCase();
        return tasks.documents.filter(task =>
            task.name.toLowerCase().includes(searchLower)
        );
    }, [tasks?.documents, localSearch]);

    const { mutate: bulkUpdate  } = useBulkUpdateTasks()


    const handleNewTask = (status?: TaskStatus, statusCustomId?: string) => {
        setInitialStatus(status);
        setInitialStatusCustomId(statusCustomId);
        setModalOpen(true);
    }

    const onKanbanChange = useCallback((tasks: { $id: string, status: TaskStatus, statusCustomId?: string | null, position: number }[]) => {
        if (isDemo) return;

        bulkUpdate({
            json: { tasks }
        })
    }, [bulkUpdate, isDemo])

    return (
       <div className="mt-0">
            <DialogContainer title={t('create-task')} isOpen={modalOpen} setIsOpen={setModalOpen}>
                <CreateTaskFormWrapper
                    onCancel={() => setModalOpen(false)}
                    initialStatus={initialStatus}
                    initialStatusCustomId={initialStatusCustomId}
                />
            </DialogContainer>
            <Tabs
                className="flex-1 w-full"
                value={currentTab}
                onValueChange={setCurrentTab}
            >
                <div className={`flex flex-col pt-2 ${currentTab === 'kanban' ? 'h-[calc(100vh-10rem)]' : 'h-full'} min-h-0`}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <TabsList className="h-10 w-full justify-start gap-1 border border-white/50 bg-background/70 p-1 shadow-sm backdrop-blur-md dark:border-white/10 lg:w-auto">
                            <TabsTrigger value="kanban" className="h-8 flex-1 bg-transparent px-3 text-foreground data-[state=active]:border data-[state=active]:border-slate-300 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-950 data-[state=active]:shadow-sm dark:data-[state=active]:border-slate-600 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white lg:flex-none">
                                Kanban
                            </TabsTrigger>
                            <TabsTrigger value="table" className="h-8 flex-1 bg-transparent px-3 text-foreground data-[state=active]:border data-[state=active]:border-slate-300 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-950 data-[state=active]:shadow-sm dark:data-[state=active]:border-slate-600 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white lg:flex-none">
                                {t('table')}
                            </TabsTrigger>
                            <TabsTrigger value="calendar" className="h-8 flex-1 bg-transparent px-3 text-foreground data-[state=active]:border data-[state=active]:border-slate-300 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-950 data-[state=active]:shadow-sm dark:data-[state=active]:border-slate-600 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white lg:flex-none">
                                {t('calendar')}
                            </TabsTrigger>
                            {canViewGantt && (
                                <TabsTrigger value="gantt" className="h-8 flex-1 bg-transparent px-3 text-foreground data-[state=active]:border data-[state=active]:border-slate-300 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-950 data-[state=active]:shadow-sm dark:data-[state=active]:border-slate-600 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white lg:flex-none">
                                    {t('gantt')}
                                </TabsTrigger>
                            )}
                        </TabsList>
                        {canWrite && canCreateTask && (
                            <Button
                                size='sm'
                                className="h-10 w-full border border-white/50 bg-background/75 shadow-sm backdrop-blur-md hover:bg-background/90 lg:w-auto"
                                variant='outline'
                                onClick={() => handleNewTask()}
                            >
                                <PlusIcon className="size-4 mr-2" />
                                {t('new')}
                            </Button>
                        )}
                    </div>

                    <div className="my-3 rounded-xl border border-white/50 bg-background/55 p-2 shadow-sm backdrop-blur-md dark:border-white/10">
                        <DataFilters
                            localSearch={localSearch}
                            onLocalSearchChange={setLocalSearch}
                        />
                    </div>

                    <div className="flex-1 min-h-0">
                    {isLoadingTasks ? (
                        <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
                            <Loader className="size-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <>
                            <TabsContent value="table" className="mt-0 overflow-auto">
                                <DataTable columns={columns} data={filteredTasks as Task[]} />
                            </TabsContent>
                            <TabsContent value="kanban" className="mt-0 h-full overflow-hidden">
                                <DataKanban
                                    data={filteredTasks as Task[]}
                                    addTask={handleNewTask}
                                    onChangeTasks={onKanbanChange}
                                    openSettings={openSettings}
                                />
                            </TabsContent>
                            <TabsContent value="calendar" className="mt-0 h-full pb-4">
                                <DataCalendar data={filteredTasks as Task[]} />
                            </TabsContent>
                            {canViewGantt && (
                                <TabsContent value="gantt" className="mt-0 h-full pb-4">
                                    <DataGantt data={filteredTasks as Task[]} />
                                </TabsContent>
                            )}
                        </>

                    )}
                    </div>
                </div>
            </Tabs>
       </div>
    );
}

export default TaskSwitcher;