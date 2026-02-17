import { useMemo } from "react";
import { useGetTasks } from "../api/use-get-tasks";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { Task } from "../types";

export const useParentTask = (parentId: string | null | undefined): Task | null => {
    const workspaceId = useWorkspaceId();
    const { data: tasksData } = useGetTasks({ workspaceId });

    const parentTask = useMemo((): Task | null => {
        if (!parentId || !tasksData?.documents) return null;
        const found = tasksData.documents.find(t => t.$id === parentId);
        return (found as Task) || null;
    }, [parentId, tasksData?.documents]);

    return parentTask;
};
