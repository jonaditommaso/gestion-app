import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { getMember } from "@/features/workspaces/members/utils";
import { DATABASE_ID, MEMBERS_ID, TASK_ACTIVITY_LOGS_ID, TASKS_ID } from "@/config";
import { Query } from "node-appwrite";
import { Task, WorkspaceMember } from "../types";
import { TaskActivityLog } from "../types/activity-log";

const getTaskActivityLogsSchema = z.object({
    taskId: z.string()
});

const app = new Hono()

    .get(
        '/',
        sessionMiddleware,
        zValidator('query', getTaskActivityLogsSchema),
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { taskId } = ctx.req.valid('query');

            // Get the task to verify workspace membership
            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            // Verify user is a member of the workspace
            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Get all activity logs for this task
            const activityLogs = await databases.listDocuments<TaskActivityLog>(
                DATABASE_ID,
                TASK_ACTIVITY_LOGS_ID,
                [
                    Query.equal('taskId', taskId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100) // Limit to last 100 activities
                ]
            );

            // Get unique actor member IDs
            const actorIds = [...new Set(activityLogs.documents.map(log => log.actorMemberId))];

            // Get actor details
            const actors = actorIds.length > 0
                ? await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', actorIds)]
                )
                : { documents: [] };

            // Map logs with actor data
            const populatedLogs = activityLogs.documents.map(log => ({
                ...log,
                actor: actors.documents.find(a => a.$id === log.actorMemberId)
            }));

            return ctx.json({ data: { ...activityLogs, documents: populatedLogs } });
        }
    );

export default app;
