'use client'

import ErrorPage from "@/app/error";
import CustomLoader from "@/components/CustomLoader";
import { useGetTask } from "@/features/tasks/api/use-get-task";
import TaskDescription from "@/features/tasks/components/TaskDescription";
import TaskOverview from "@/features/tasks/components/TaskOverview";
import { useTaskId } from "@/features/tasks/hooks/use-task-id";

const TaskIdClient = () => {
    const taskId = useTaskId();
    const { data, isLoading } = useGetTask({ taskId})

    if (isLoading) return <CustomLoader />

    if (!data) return <ErrorPage />

    return (
        <div className="flex flex-col w-[90%] ml-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TaskOverview task={data} />
                <TaskDescription task={data} />
            </div>
        </div>
    );
}

export default TaskIdClient;