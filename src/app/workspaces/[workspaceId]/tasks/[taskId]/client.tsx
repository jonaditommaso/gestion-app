'use client'

import CustomLoader from "@/components/CustomLoader";
import { useGetTask } from "@/features/tasks/api/use-get-task";
import { useTaskId } from "@/features/tasks/hooks/use-task-id";
import TaskDetails, { TaskTitleEditor } from "@/features/tasks/components/TaskDetails";
import TaskActions from "@/features/tasks/components/TaskActions";
import { notFound } from "next/navigation";
import { useCurrentUserPermissions } from "@/features/roles/hooks/useCurrentUserPermissions";
import { PERMISSIONS } from "@/features/roles/constants";

const TaskIdClient = () => {
    const taskId = useTaskId();
    const { data, isLoading } = useGetTask({ taskId })
    const { hasPermission } = useCurrentUserPermissions();
    const canWrite = hasPermission(PERMISSIONS.WRITE);

    if (isLoading) return <CustomLoader />

    if (!data) notFound()

    return (
        <div className="flex flex-col w-full px-6 py-4">
            <div className="max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <TaskTitleEditor
                        taskId={data.$id}
                        initialTitle={data.name}
                        initialType={data.type}
                        readOnly={!canWrite}
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
                <TaskDetails task={data} variant="page" readOnly={!canWrite} />
            </div>
        </div>
    );
}

export default TaskIdClient;