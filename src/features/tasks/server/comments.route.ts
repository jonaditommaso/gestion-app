import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createTaskCommentSchema, getTaskCommentsSchema, updateTaskCommentSchema } from "../schemas";
import { getMember } from "@/features/workspaces/members/utils";
import { DATABASE_ID, MEMBERS_ID, TASK_COMMENTS_ID, TASKS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { Task, TaskComment, WorkspaceMember } from "../types";
import { createActivityLog } from "../utils/create-activity-log";
import { ActivityAction } from "../types/activity-log";

const app = new Hono()

    .get(
        '/',
        sessionMiddleware,
        zValidator('query', getTaskCommentsSchema),
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

            // Get all comments for this task
            const comments = await databases.listDocuments<TaskComment>(
                DATABASE_ID,
                TASK_COMMENTS_ID,
                [
                    Query.equal('taskId', taskId),
                    Query.orderDesc('$createdAt')
                ]
            );

            // Get unique author member IDs
            const authorIds = [...new Set(comments.documents.map(c => c.authorMemberId))];

            // Get author details
            const authors = authorIds.length > 0
                ? await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', authorIds)]
                )
                : { documents: [] };

            // Map comments with author data
            const populatedComments = comments.documents.map(comment => ({
                ...comment,
                author: authors.documents.find(a => a.$id === comment.authorMemberId)
            }));

            return ctx.json({ data: { ...comments, documents: populatedComments } });
        }
    )

    .post(
        '/',
        sessionMiddleware,
        zValidator('json', createTaskCommentSchema),
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { taskId, content } = ctx.req.valid('json');

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

            // Create the comment
            let comment;
            try {
                comment = await databases.createDocument<TaskComment>(
                    DATABASE_ID,
                    TASK_COMMENTS_ID,
                    ID.unique(),
                    {
                        taskId,
                        authorMemberId: member.$id,
                        content
                    }
                );
            } catch (err: unknown) {
                const error = err as { type?: string; message?: string };
                if (error.type === 'document_invalid_structure' && error.message?.includes('2048')) {
                    return ctx.json({ error: 'content_too_long' }, 400);
                }
                throw err;
            }

            // Create activity log for comment creation (non-blocking)
            createActivityLog({
                databases,
                taskId,
                actorMemberId: member.$id,
                action: ActivityAction.COMMENT_UPDATED,
                payload: {
                    subAction: 'created',
                    commentId: comment.$id
                }
            }).catch(err => console.error('Error creating activity log:', err));

            return ctx.json({
                data: {
                    ...comment,
                    author: member
                }
            });
        }
    )

    .patch(
        '/:commentId',
        sessionMiddleware,
        zValidator('json', updateTaskCommentSchema),
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { commentId } = ctx.req.param();
            const { content } = ctx.req.valid('json');

            // Get the comment
            const existingComment = await databases.getDocument<TaskComment>(
                DATABASE_ID,
                TASK_COMMENTS_ID,
                commentId
            );

            // Get the task to verify workspace membership
            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                existingComment.taskId
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

            // Only the author can update their comment
            if (existingComment.authorMemberId !== member.$id) {
                return ctx.json({ error: 'You can only edit your own comments' }, 403);
            }

            // Update the comment
            let updatedComment;
            try {
                updatedComment = await databases.updateDocument<TaskComment>(
                    DATABASE_ID,
                    TASK_COMMENTS_ID,
                    commentId,
                    { content }
                );
            } catch (err: unknown) {
                const error = err as { type?: string; message?: string };
                if (error.type === 'document_invalid_structure' && error.message?.includes('2048')) {
                    return ctx.json({ error: 'content_too_long' }, 400);
                }
                throw err;
            }

            // Create activity log for comment edit (non-blocking)
            createActivityLog({
                databases,
                taskId: existingComment.taskId,
                actorMemberId: member.$id,
                action: ActivityAction.COMMENT_UPDATED,
                payload: {
                    subAction: 'edited',
                    commentId
                }
            }).catch(err => console.error('Error creating activity log:', err));

            return ctx.json({
                data: {
                    ...updatedComment,
                    author: member
                }
            });
        }
    )

    .delete(
        '/:commentId',
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { commentId } = ctx.req.param();

            // Get the comment
            const comment = await databases.getDocument<TaskComment>(
                DATABASE_ID,
                TASK_COMMENTS_ID,
                commentId
            );

            // Get the task to verify workspace membership
            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                comment.taskId
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

            // Only the author can delete their comment
            if (comment.authorMemberId !== member.$id) {
                return ctx.json({ error: 'You can only delete your own comments' }, 403);
            }

            // Delete the comment
            await databases.deleteDocument(
                DATABASE_ID,
                TASK_COMMENTS_ID,
                commentId
            );

            // Create activity log for comment deletion (non-blocking)
            createActivityLog({
                databases,
                taskId: comment.taskId,
                actorMemberId: member.$id,
                action: ActivityAction.COMMENT_UPDATED,
                payload: {
                    subAction: 'deleted',
                    commentId
                }
            }).catch(err => console.error('Error creating activity log:', err));

            return ctx.json({ data: { $id: commentId, taskId: comment.taskId } });
        }
    )

export default app;
