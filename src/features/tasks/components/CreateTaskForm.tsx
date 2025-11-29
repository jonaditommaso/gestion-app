'use client'
import { useCreateTask } from "../api/use-create-task";
import { useForm } from "react-hook-form";
import { z as zod } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema } from "../schemas";
import { useWorkspaceId } from "@/app/workspaces/hooks/use-workspace-id";
import { Card, CardContent,  } from "@/components/ui/card"; //CardHeader, CardTitle
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CustomDatePicker from "@/components/CustomDatePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { TASK_PRIORITY_OPTIONS } from "../constants/priority";
import { TASK_TYPE_OPTIONS } from "../constants/type";
import { useCustomStatuses } from "@/app/workspaces/hooks/use-custom-statuses";
import RichTextArea from "@/components/RichTextArea";
import { TaskStatus } from "../types";
import { useUploadTaskImage } from "../api/use-upload-task-image";
import { stringifyTaskMetadata } from "../utils/metadata-helpers";
import { useHandleImageUpload } from "../hooks/useHandleImageUpload";
import { processDescriptionImages } from "../utils/processDescriptionImages";
import { checkEmptyContent } from "@/utils/checkEmptyContent";
import { WorkspaceConfigKey } from "@/app/workspaces/constants/workspace-config-keys";
import { useWorkspaceConfig } from "@/app/workspaces/hooks/use-workspace-config";
import { useStatusDisplayName } from "@/app/workspaces/hooks/use-status-display-name";
import { useMemo } from "react";
import { MultiSelect } from "@/components/ui/multi-select";
import { useCurrent } from "@/features/auth/api/use-current";
import { useGetMembers } from "@/features/members/api/use-get-members";

interface CreateTaskFormProps {
    memberOptions?: { id: string, name: string }[],
    onCancel: () => void,
    initialStatus?: TaskStatus,
    initialStatusCustomId?: string
}

const CreateTaskForm = ({ onCancel, memberOptions, initialStatus, initialStatusCustomId }: CreateTaskFormProps) => {
    const { mutate, isPending } = useCreateTask();
    const workspaceId = useWorkspaceId();
    const t = useTranslations('workspaces');
    const { mutateAsync: uploadTaskImage } = useUploadTaskImage();
    const { pendingImages, setPendingImages, handleImageUpload } = useHandleImageUpload();
    const { data: currentUser } = useCurrent();
    const { data: membersData } = useGetMembers({ workspaceId });

    const config = useWorkspaceConfig();
    const defaultTaskStatus = config[WorkspaceConfigKey.DEFAULT_TASK_STATUS] as TaskStatus;
    const { getStatusDisplayName } = useStatusDisplayName();
    const { allStatuses, getIconComponent } = useCustomStatuses();

    // Encontrar el ID del miembro actual en el workspace
    const currentMemberId = membersData?.documents?.find(m => m.userId === currentUser?.$id)?.$id;

    // Crear schema dinámico basado en la configuración del workspace
    const dynamicSchema = useMemo(() => {
        const baseSchema = createTaskSchema.omit({ workspaceId: true });

        // todo: remove any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extensions: Record<string, any> = {};

        // Si el asignado es requerido
        if (config[WorkspaceConfigKey.REQUIRED_ASSIGNEE]) {
            extensions.assigneesIds = zod.array(zod.string()).min(1, t('assignee-required'));
        }

        // Si la fecha de vencimiento es requerida
        if (config[WorkspaceConfigKey.REQUIRED_DUE_DATE]) {
            extensions.dueDate = zod.coerce.date({ required_error: t('due-date-required') });
        }

        // Si la descripción es requerida
        if (config[WorkspaceConfigKey.REQUIRED_DESCRIPTION]) {
            extensions.description = zod.string().min(1, t('description-required'));
        }

        // Si hay extensiones, aplicarlas al schema
        if (Object.keys(extensions).length > 0) {
            return baseSchema.extend(extensions);
        }

        return baseSchema;
    }, [config, t]);

    // Para custom statuses, usar el statusCustomId como valor del selector
    const effectiveInitialStatus = initialStatus === TaskStatus.CUSTOM && initialStatusCustomId
        ? initialStatusCustomId as TaskStatus
        : (initialStatus || defaultTaskStatus);

    const form = useForm<zod.infer<typeof createTaskSchema>>({
        resolver: zodResolver(dynamicSchema),
        defaultValues: {
            workspaceId,
            priority: 3, // default
            type: 'task', // default
            status: effectiveInitialStatus,
            assigneesIds: [],
        }
    })

    const onSubmit = async (values: zod.infer<typeof createTaskSchema>) => {
        const { description, status, ...rest } = values

        // Procesar imágenes en la descripción si existen
        let processedDescription = description;
        const imageIds: string[] = [];

        if (description && pendingImages.size > 0) {
            const result = await processDescriptionImages(description, pendingImages, uploadTaskImage);
            processedDescription = result.html;
            imageIds.push(...result.imageIds);
        }

        // Detectar si es un custom status (el valor del selector será CUSTOM_xxxxx)
        const isCustomStatus = status.startsWith('CUSTOM_');
        const finalStatus = isCustomStatus ? TaskStatus.CUSTOM : status;
        const statusCustomId = isCustomStatus ? status : null;

        const payload = {
            ...rest,
            status: finalStatus,
            workspaceId,
            // Incluir statusCustomId si es un custom status
            ...(statusCustomId && { statusCustomId }),
            ...(processedDescription && { description: checkEmptyContent(processedDescription) ? null : processedDescription }),
            ...(imageIds.length > 0 && {
                metadata: stringifyTaskMetadata({ imageIds })
            })
        }

        mutate({ json: payload }, {
            onSuccess: () => {
                form.reset();
                setPendingImages(new Map());
                onCancel?.()
            }
        })
    }

    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardContent className="p-2 pt-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
                        <div className="flex flex-col gap-y-4">
                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('task-name')}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder={t('enter-task-name')}
                                                className="!mt-0"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='description'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('description')}
                                        </FormLabel>
                                        <FormControl>
                                            <RichTextArea
                                                {...field}
                                                placeholder={t('add-description')}
                                                memberOptions={memberOptions}
                                                onImageUpload={handleImageUpload}
                                                className="!mt-0"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-x-4">
                                <FormField
                                    control={form.control}
                                    name='assigneesIds'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('assignee')}
                                            </FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    options={memberOptions?.map(member => ({
                                                        label: member.name,
                                                        value: member.id
                                                    })) || []}
                                                    selected={field.value || []}
                                                    onChange={field.onChange}
                                                    currentUserId={currentMemberId}
                                                    showAssignToMe={true}
                                                    className="!mt-0"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='priority'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('priority')}
                                            </FormLabel>
                                            <Select
                                                defaultValue={String(field.value)}
                                                onValueChange={(value) => field.onChange(Number(value))}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="!mt-0">
                                                        <SelectValue placeholder={t('select-priority')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <FormMessage />
                                                <SelectContent>
                                                    {TASK_PRIORITY_OPTIONS.map((priority) => {
                                                        const Icon = priority.icon
                                                        return (
                                                            <SelectItem key={priority.value} value={String(priority.value)}>
                                                                <div className="flex items-center gap-x-2">
                                                                    <Icon
                                                                        className="size-4"
                                                                        style={{ color: priority.color }}
                                                                    />
                                                                    {t(priority.translationKey)}
                                                                </div>
                                                            </SelectItem>
                                                        )
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-x-4">
                                <FormField
                                    control={form.control}
                                    name='type'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('type')}
                                            </FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="!mt-0">
                                                        <SelectValue placeholder={t('select-type')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <FormMessage />
                                                <SelectContent>
                                                    {TASK_TYPE_OPTIONS.map((type) => {
                                                        const Icon = type.icon;
                                                        return (
                                                            <SelectItem key={type.value} value={type.value}>
                                                                <div className="flex items-center gap-x-2">
                                                                    <Icon className={cn("size-4", type.textColor)} />
                                                                    {t(type.translationKey)}
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='label'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('label')}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder={t('enter-label')}
                                                    maxLength={25}
                                                    className="!mt-0"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-x-4">
                                <FormField
                                    control={form.control}
                                    name='status'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('status')}
                                            </FormLabel>
                                            <Select
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="!mt-0">
                                                        <SelectValue placeholder={t('select-status')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <FormMessage />
                                                <SelectContent>
                                                    {allStatuses.map((status) => {
                                                        const IconComponent = getIconComponent(status.icon);
                                                        return (
                                                            <SelectItem key={status.id} value={status.id}>
                                                                <div className="flex items-center gap-x-2">
                                                                    <IconComponent className="size-3" style={{ color: status.color }} />
                                                                    {status.isDefault ? getStatusDisplayName(status.id as TaskStatus) : status.label}
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='dueDate'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('due-date')}
                                            </FormLabel>
                                            <FormControl>
                                                <CustomDatePicker
                                                    value={field.value ?? undefined}
                                                    onChange={field.onChange}
                                                    className="!mt-0"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <Button
                                type='button'
                                size='lg'
                                variant='secondary'
                                onClick={onCancel}
                                disabled={isPending}
                                className={cn(!onCancel && 'invisible')}
                            >
                                {t('cancel')}
                            </Button>
                            <Button
                                type='submit'
                                size='lg'
                                disabled={isPending}
                            >
                                {t('create-task')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export default CreateTaskForm;