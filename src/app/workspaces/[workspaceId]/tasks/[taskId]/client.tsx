'use client'

import ErrorPage from "@/app/error";
import CustomLoader from "@/components/CustomLoader";
import { useGetTask } from "@/features/tasks/api/use-get-task";
import { useTaskId } from "@/features/tasks/hooks/use-task-id";
import TaskDetails, { TaskTitleEditor } from "@/features/tasks/components/TaskDetails";
import TaskActions from "@/features/tasks/components/TaskActions";

const TaskIdClient = () => {
    const taskId = useTaskId();
    const { data, isLoading } = useGetTask({ taskId })

    if (isLoading) return <CustomLoader />

    if (!data) return <ErrorPage />

    return (
        <div className="flex flex-col w-full px-6 py-4">
            <div className="max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <TaskTitleEditor
                        taskId={data.$id}
                        initialTitle={data.name}
                        initialType={data.type}
                        size="page"
                    />
                    <TaskActions
                        taskId={data.$id}
                        taskName={data.name}
                        taskType={data.type}
                        isFeatured={data.featured}
                        variant="page"
                    />
                </div>

                {/* Content */}
                <TaskDetails task={data} variant="page" />
            </div>
        </div>
    );
}

export default TaskIdClient;