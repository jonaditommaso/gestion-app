'use client'
import { DialogContainer } from "@/components/DialogContainer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader, PlusIcon } from "lucide-react";
import { useCallback, useState } from "react";
import CreateTaskFormWrapper from "./CreateTaskFormWrapper";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { useGetTasks } from "../api/use-get-tasks";
import DataFilters from "./DataFilters";
import { useTaskFilters } from "../hooks/use-task-filters";
import { DataTable } from "./DataTable";
import { columns } from "../columns";
import DataKanban from "./DataKanban";
import { TaskStatus } from "../types";
import { useBulkUpdateTasks } from "../api/use-bulk-update-tasks";
import DataCalendar from "./DataCalendar";
import { useTranslations } from "next-intl";

const TaskSwitcher = () => {
    const workspaceId = useWorkspaceId();
    const [modalOpen, setModalOpen] = useState(false);
    const [currentTab, setCurrentTab] = useState('table') // I can use useQueryState from nuqs in order to keep the tab selected if I refresh
    const t = useTranslations('workspaces');

    const [{
        status,
        assigneeId,
        dueDate
    }] = useTaskFilters();

    const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({ workspaceId, status, assigneeId, dueDate });

    const { mutate: bulkUpdate  } = useBulkUpdateTasks()


    const handleNewTask = () => {
        setModalOpen(true)
    }

    const onKanbanChange = useCallback((tasks: { $id: string, status: TaskStatus, position: number }[]) => {
        bulkUpdate({
            json: { tasks }
        })
    }, [bulkUpdate])

    return (
       <div className="mt-2">
            <DialogContainer title="Crear task" isOpen={modalOpen} setIsOpen={setModalOpen}>
                <CreateTaskFormWrapper onCancel={() => setModalOpen(false)} />
            </DialogContainer>
            <Tabs
                className="flex-1 w-full border rounded-lg"
                defaultValue={currentTab}
                onValueChange={setCurrentTab}
            >
                <div className="h-full flex flex-col p-4">
                    <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
                        <TabsList className="w-full lg:w-auto">
                            <TabsTrigger value="table" className="h-8 w-full lg:w-auto">
                                {t('table')}
                            </TabsTrigger>
                            <TabsTrigger value="kanban" className="h-8 w-full lg:w-auto">
                                Kanban
                            </TabsTrigger>
                            <TabsTrigger value="calendar" className="h-8 w-full lg:w-auto">
                                {t('calendar')}
                            </TabsTrigger>
                        </TabsList>
                        <Button
                            size='sm'
                            className="w-full lg:w-auto"
                            onClick={handleNewTask}
                        >
                            <PlusIcon className="size-4 mr-2" />
                            {t('new')}
                        </Button>
                    </div>

                    <Separator className="my-4" />
                        <DataFilters />
                    <Separator className="my-4" />

                    {isLoadingTasks ? (
                        <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
                            <Loader className="size-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <>
                            <TabsContent value="table" className="mt-0 overflow-auto">
                                <DataTable columns={columns} data={tasks?.documents ?? []} />
                            </TabsContent>
                            <TabsContent value="kanban" className="mt-0">
                                <DataKanban
                                    data={tasks?.documents ?? []}
                                    addTask={handleNewTask}
                                    onChangeTasks={onKanbanChange}
                                />
                            </TabsContent>
                            <TabsContent value="calendar" className="mt-0 h-full pb-4">
                                <DataCalendar data={tasks?.documents ?? []} />
                            </TabsContent>
                        </>

                    )}
                </div>
            </Tabs>
       </div>
    );
}

export default TaskSwitcher;