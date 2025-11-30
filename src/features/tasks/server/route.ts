import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createTaskSchema, createTaskShareSchema, getTaskSchema } from "../schemas";
import { getMember } from "@/features/workspaces/members/utils";
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, TASK_ASSIGNEES_ID, TASK_SHARES_ID, TASKS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { Task, TaskStatus, WorkspaceMember } from "../types";
import { z as zod } from 'zod';
import { getImageIds, parseTaskMetadata } from "../utils/metadata-helpers";
import { Models } from "node-appwrite";

interface TaskAssignee extends Models.Document {
    taskId: string;
    workspaceMemberId: string;
}

const app = new Hono()

    .get(
        '/',
        sessionMiddleware,
        zValidator('query', getTaskSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { search, status, workspaceId, dueDate, assigneeId, priority } = ctx.req.valid('query');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const query = [
                Query.equal('workspaceId', workspaceId),
                Query.orderDesc('$createdAt'),
            ]

            if (status) {
                query.push(Query.equal('status', status))
            }

            if (dueDate) {
                query.push(Query.equal('dueDate', dueDate))
            }

            if (search) {
                query.push(Query.equal('name', search))
            }

            if (priority) {
                query.push(Query.equal('priority', priority))
            }

            const tasks = await databases.listDocuments<Task>(
                DATABASE_ID,
                TASKS_ID,
                query
            )

            // Obtener todos los task IDs
            let taskIds = tasks.documents.map(task => task.$id);

            // Si hay filtro por assigneeId, obtener solo las tareas asignadas a ese miembro
            if (assigneeId) {
                const assigneeTasksResult = await databases.listDocuments<TaskAssignee>(
                    DATABASE_ID,
                    TASK_ASSIGNEES_ID,
                    [Query.equal('workspaceMemberId', assigneeId)]
                );
                const assigneeTaskIds = assigneeTasksResult.documents.map(ta => ta.taskId);
                // Filtrar taskIds para incluir solo los que están asignados al miembro
                taskIds = taskIds.filter(id => assigneeTaskIds.includes(id));
            }

            // Obtener todas las asignaciones de tareas
            const taskAssignees = taskIds.length > 0
                ? await databases.listDocuments<TaskAssignee>(
                    DATABASE_ID,
                    TASK_ASSIGNEES_ID,
                    [Query.contains('taskId', taskIds)]
                )
                : { documents: [] };

            // Obtener los IDs únicos de workspace members
            const memberIds = [...new Set(taskAssignees.documents.map(ta => ta.workspaceMemberId))];

            // Obtener los datos de los members desde la colección
            const members = memberIds.length > 0
                ? await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', memberIds)]
                )
                : { documents: [] };

            // Mapear las tareas con sus assignees
            const populatedTasks = tasks.documents
                .filter(task => taskIds.includes(task.$id)) // Filtrar por taskIds (incluye filtro de assigneeId si aplica)
                .map(task => {
                    // Encontrar todas las asignaciones para esta tarea
                    const taskAssignments = taskAssignees.documents.filter(ta => ta.taskId === task.$id);

                    // Obtener los miembros asignados a esta tarea
                    const assignees = taskAssignments.map(ta => {
                        return members.documents.find(m => m.$id === ta.workspaceMemberId);
                    }).filter(Boolean); // Eliminar valores undefined

                    return {
                        ...task,
                        assignees // Array de assignees en lugar de assignee único
                    }
                });

            return ctx.json({
                data: { ...tasks, documents: populatedTasks }
            })

        }
    )

    .post(
        '/',
        sessionMiddleware,
        zValidator('json', createTaskSchema),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { name, status, statusCustomId, workspaceId, dueDate, assigneesIds, priority, description } = ctx.req.valid('json');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const highestPositionTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                status === TaskStatus.CUSTOM && statusCustomId
                    ? [
                        Query.equal('status', TaskStatus.CUSTOM),
                        Query.equal('statusCustomId', statusCustomId),
                        Query.equal('workspaceId', workspaceId),
                        Query.orderAsc('position'),
                        Query.limit(1),
                    ]
                    : [
                        Query.equal('status', status),
                        Query.equal('workspaceId', workspaceId),
                        Query.orderAsc('position'),
                        Query.limit(1),
                    ]
            )

            const newPosition = highestPositionTask.documents.length > 0
                ? highestPositionTask.documents[0].position + 1000
                : 1000

            const task = await databases.createDocument(
                DATABASE_ID,
                TASKS_ID,
                ID.unique(),
                {
                    name,
                    status,
                    statusCustomId: status === TaskStatus.CUSTOM ? statusCustomId : null,
                    workspaceId,
                    dueDate,
                    // assigneeId,
                    priority,
                    description,
                    position: newPosition,
                    createdBy: member.$id,
                }
            )

            // Create task assignees if exist
            if (assigneesIds && assigneesIds.length > 0) {
                await Promise.all(
                    assigneesIds.map((memberId: string) =>
                        databases.createDocument(
                            DATABASE_ID,
                            TASK_ASSIGNEES_ID,
                            ID.unique(),
                            {
                                taskId: task.$id,
                                workspaceMemberId: memberId,
                            }
                        )
                    )
                );
            }

            // Obtener los datos completos de los assignees
            const assignees = assigneesIds && assigneesIds.length > 0
                ? await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', assigneesIds)]
                )
                : { documents: [] };

            return ctx.json({
                data: {
                    ...task,
                    assignees: assignees.documents
                }
            })
        }
    )

    .delete(
        '/:taskId',
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const storage = ctx.get('storage');

            const { taskId } = ctx.req.param();

            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id
            })

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            // Eliminar todas las imágenes asociadas usando metadata
            const imageIds = getImageIds(task);
            if (imageIds.length > 0) {
                for (const imageId of imageIds) {
                    try {
                        await storage.deleteFile(IMAGES_BUCKET_ID, imageId);
                    } catch (err) {
                        console.error(`Error deleting image ${imageId}:`, err);
                        // Continuar con la eliminación de la tarea aunque falle la eliminación de imágenes
                    }
                }
            }

            // Eliminar todos los assignees de la task
            const assignees = await databases.listDocuments(
                DATABASE_ID,
                TASK_ASSIGNEES_ID,
                [Query.equal('taskId', taskId)]
            );

            for (const assignee of assignees.documents) {
                try {
                    await databases.deleteDocument(
                        DATABASE_ID,
                        TASK_ASSIGNEES_ID,
                        assignee.$id
                    );
                } catch (err) {
                    console.error(`Error deleting task assignee ${assignee.$id}:`, err);
                }
            }

            await databases.deleteDocument(
                DATABASE_ID,
                TASKS_ID,
                taskId
            )

            return ctx.json({ data: { $id: task.$id } })
        }
    )

    .patch(
        '/:taskId',
        sessionMiddleware,
        zValidator('json', createTaskSchema.partial()),
        async (ctx) => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const storage = ctx.get('storage');

            const updates = ctx.req.valid('json');

            const { taskId } = ctx.req.param()

            const existingTask = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            )

            const member = await getMember({
                databases,
                workspaceId: existingTask.workspaceId,
                userId: user.$id
            })

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            // Si se está actualizando metadata, eliminar imágenes que ya no están presentes
            if (updates.metadata !== undefined) {
                const oldImageIds = getImageIds(existingTask);
                const newMetadata = parseTaskMetadata(updates.metadata);
                const newImageIds = newMetadata.imageIds || [];

                // Encontrar imágenes que fueron eliminadas
                const deletedImageIds = oldImageIds.filter(id => !newImageIds.includes(id));

                // Eliminar imágenes que ya no están en el array
                for (const imageId of deletedImageIds) {
                    try {
                        await storage.deleteFile(IMAGES_BUCKET_ID, imageId);
                    } catch (err) {
                        console.error(`Error deleting image ${imageId}:`, err);
                        // Continuar con la actualización aunque falle la eliminación de imágenes
                    }
                }
            }

            // Si se actualiza el status y no es CUSTOM, limpiar statusCustomId
            const finalUpdates = { ...updates };
            if (updates.status && updates.status !== TaskStatus.CUSTOM) {
                finalUpdates.statusCustomId = null;
            }

            const task = await databases.updateDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId,
                finalUpdates
            )

            // Obtener las asignaciones de esta tarea
            const taskAssignees = await databases.listDocuments<TaskAssignee>(
                DATABASE_ID,
                TASK_ASSIGNEES_ID,
                [Query.equal('taskId', taskId)]
            );

            // Obtener los IDs de los workspace members
            const memberIds = taskAssignees.documents.map(ta => ta.workspaceMemberId);

            // Obtener los datos de los members
            const assignees = memberIds.length > 0
                ? await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', memberIds)]
                )
                : { documents: [] };

            return ctx.json({
                data: {
                    ...task,
                    assignees: assignees.documents
                }
            })
        }
    )

    .get(
        '/:taskId',
        sessionMiddleware,
        async ctx => {
            const currentUser = ctx.get('user');
            const databases = ctx.get('databases');

            const { taskId } = ctx.req.param();

            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            )

            const currentMember = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: currentUser.$id
            });

            if (!currentMember) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            // Obtener las asignaciones de esta tarea
            const taskAssignees = await databases.listDocuments<TaskAssignee>(
                DATABASE_ID,
                TASK_ASSIGNEES_ID,
                [Query.equal('taskId', taskId)]
            );

            // Obtener los IDs de los workspace members
            const memberIds = taskAssignees.documents.map(ta => ta.workspaceMemberId);

            // Obtener los datos de los members
            const assignees = memberIds.length > 0
                ? await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', memberIds)]
                )
                : { documents: [] };

            return ctx.json({
                data: {
                    ...task,
                    assignees: assignees.documents
                }
            })
        }
    )

    .post(
        '/bulk-update',
        sessionMiddleware,
        zValidator(
            'json',
            zod.object({
                tasks: zod.array(
                    zod.object({
                        $id: zod.string(),
                        status: zod.nativeEnum(TaskStatus),
                        statusCustomId: zod.string().optional().nullable(),
                        position: zod.number().int().positive().min(1000).max(1_000_000)
                    })
                )
            })
        ),
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { tasks } = await ctx.req.valid('json');

            const tasksToUpdate = await databases.listDocuments<Task>(
                DATABASE_ID,
                TASKS_ID,
                [Query.contains('$id', tasks.map(task => task.$id))]
            )

            const workspaceIds = new Set(tasksToUpdate.documents.map(task => task.workspaceId))

            if (workspaceIds.size !== 1) {
                return ctx.json({ error: 'All tasks must belong to the same workspace' })
            }

            const workspaceId = workspaceIds.values().next().value!;

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401)
            }

            const updatedTasks = await Promise.all(tasks.map(async task => {
                const { $id, status, statusCustomId, position } = task;

                return databases.updateDocument<Task>(
                    DATABASE_ID,
                    TASKS_ID,
                    $id,
                    {
                        status,
                        position,
                        // Si es CUSTOM, guardar el ID; si no, limpiar el campo
                        statusCustomId: status === TaskStatus.CUSTOM ? statusCustomId : null
                    }
                )
            }))

            return ctx.json({ data: updatedTasks })
        }
    )

    .post(
        '/:taskId/assign',
        sessionMiddleware,
        zValidator('json', zod.object({
            workspaceMemberId: zod.string()
        })),
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { taskId } = ctx.req.param();
            const { workspaceMemberId } = ctx.req.valid('json');

            // Get task
            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            // Check authorization
            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Check if already assigned
            const existingAssignment = await databases.listDocuments<TaskAssignee>(
                DATABASE_ID,
                TASK_ASSIGNEES_ID,
                [
                    Query.equal('taskId', taskId),
                    Query.equal('workspaceMemberId', workspaceMemberId)
                ]
            );

            if (existingAssignment.documents.length > 0) {
                return ctx.json({ error: 'Member already assigned' }, 400);
            }

            // Create assignment
            await databases.createDocument(
                DATABASE_ID,
                TASK_ASSIGNEES_ID,
                ID.unique(),
                {
                    taskId,
                    workspaceMemberId
                }
            );

            // Get updated assignees
            const taskAssignees = await databases.listDocuments<TaskAssignee>(
                DATABASE_ID,
                TASK_ASSIGNEES_ID,
                [Query.equal('taskId', taskId)]
            );

            const memberIds = taskAssignees.documents.map(ta => ta.workspaceMemberId);
            const assignees = memberIds.length > 0
                ? await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', memberIds)]
                )
                : { documents: [] };

            return ctx.json({
                data: {
                    ...task,
                    assignees: assignees.documents
                }
            });
        }
    )

    .delete(
        '/:taskId/assign/:workspaceMemberId',
        sessionMiddleware,
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');
            const { taskId, workspaceMemberId } = ctx.req.param();

            // Get task
            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            // Check authorization
            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Find assignment
            const assignment = await databases.listDocuments<TaskAssignee>(
                DATABASE_ID,
                TASK_ASSIGNEES_ID,
                [
                    Query.equal('taskId', taskId),
                    Query.equal('workspaceMemberId', workspaceMemberId)
                ]
            );

            if (assignment.documents.length === 0) {
                return ctx.json({ error: 'Assignment not found' }, 404);
            }

            // Delete assignment
            await databases.deleteDocument(
                DATABASE_ID,
                TASK_ASSIGNEES_ID,
                assignment.documents[0].$id
            );

            // Get updated assignees
            const taskAssignees = await databases.listDocuments<TaskAssignee>(
                DATABASE_ID,
                TASK_ASSIGNEES_ID,
                [Query.equal('taskId', taskId)]
            );

            const memberIds = taskAssignees.documents.map(ta => ta.workspaceMemberId);
            const assignees = memberIds.length > 0
                ? await databases.listDocuments<WorkspaceMember>(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains('$id', memberIds)]
                )
                : { documents: [] };

            return ctx.json({
                data: {
                    ...task,
                    assignees: assignees.documents
                }
            });
        }
    )

    .post(
        '/upload-task-image',
        sessionMiddleware,
        zValidator('form', zod.object({
            image: zod.any(),
            // workspaceId: zod.string()
        })),
        async ctx => {
            // TODO: check member authorization
            // const user = ctx.get('user');
            const storage = ctx.get('storage');
            // const databases = ctx.get('databases');

            const body = await ctx.req.formData();
            const image = body.get('image');
            // const workspaceId = body.get('workspaceId') as string;

            // if (!workspaceId) {
            //     return ctx.json({ error: 'workspaceId is required' }, 400);
            // }

            // // Verificar que el usuario es miembro del workspace
            // const member = await getMember({
            //     databases,
            //     workspaceId,
            //     userId: user.$id
            // });

            // if (!member) {
            //     return ctx.json({ error: 'Unauthorized' }, 401);
            // }

            if (image && image instanceof File) {
                try {
                    // Subir la imagen al bucket
                    const file = await storage.createFile(
                        IMAGES_BUCKET_ID,
                        ID.unique(),
                        image
                    );

                    // Generar la URL para acceder a la imagen
                    const imageUrl = `/api/tasks/image/${file.$id}`;

                    return ctx.json({
                        success: true,
                        data: {
                            fileId: file.$id,
                            url: imageUrl
                        }
                    });
                } catch (err) {
                    console.error('Error uploading image:', err);
                    return ctx.json({ error: 'Failed to upload image' }, 500);
                }
            }

            return ctx.json({ error: 'No file uploaded' }, 400);
        }
    )

    .get(
        '/image/:fileId',
        sessionMiddleware,
        async ctx => {
            const storage = ctx.get('storage');
            const { fileId } = ctx.req.param();

            try {
                const fileMetadata = await storage.getFile(IMAGES_BUCKET_ID, fileId);
                const mimeType = fileMetadata.mimeType;

                const fileBuffer = await storage.getFileView(IMAGES_BUCKET_ID, fileId);

                return new Response(fileBuffer, {
                    headers: {
                        'Content-Type': mimeType,
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            } catch (err) {
                console.error('Error fetching image:', err);
                return ctx.json({ error: 'Image not found' }, 404);
            }
        }
    )

    .post(
        '/share',
        sessionMiddleware,
        zValidator('json', createTaskShareSchema),
        async ctx => {
            const user = ctx.get('user');
            const databases = ctx.get('databases');

            const { taskId, workspaceId, token, expiresAt, type, sharedBy, sharedTo, readOnly } = ctx.req.valid('json');

            // Verificar que el usuario es miembro del workspace
            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return ctx.json({ error: 'Unauthorized' }, 401);
            }

            // Verificar que la tarea existe y pertenece al workspace
            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            if (task.workspaceId !== workspaceId) {
                return ctx.json({ error: 'Task does not belong to this workspace' }, 400);
            }

            // Crear el documento de share
            await databases.createDocument(
                DATABASE_ID,
                TASK_SHARES_ID,
                ID.unique(),
                {
                    taskId,
                    workspaceId,
                    token: token || null,
                    expiresAt: expiresAt || null,
                    type,
                    sharedBy,
                    sharedTo: sharedTo || null,
                    readOnly,
                }
            );

            return ctx.json({ success: true });
        }
    )

export default app;