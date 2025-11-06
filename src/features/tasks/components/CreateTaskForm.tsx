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
import MemberAvatar from "@/features/members/components/MemberAvatar";
import { useTranslations } from "next-intl";
import { TASK_STATUS_OPTIONS } from "../constants/status";
import { TASK_PRIORITY_OPTIONS } from "../constants/priority";
import { TASK_TYPE_OPTIONS } from "../constants/type";
import RichTextArea from "@/components/RichTextArea";
import { TaskStatus } from "../types";

interface CreateTaskFormProps {
    memberOptions?: { id: string, name: string }[],
    onCancel: () => void,
    initialStatus?: TaskStatus
}

const CreateTaskForm = ({ onCancel, memberOptions, initialStatus }: CreateTaskFormProps) => {
    const { mutate, isPending } = useCreateTask();
    const workspaceId = useWorkspaceId();
    const t = useTranslations('workspaces');

    const form = useForm<zod.infer<typeof createTaskSchema>>({
        resolver: zodResolver(createTaskSchema.omit({ workspaceId: true })),
        defaultValues: {
            workspaceId,
            priority: 3, // default
            type: 'task', // default
            status: initialStatus,
        }
    })

    const onSubmit = (values: zod.infer<typeof createTaskSchema>) => {
        const { description, ...rest } = values

        const payload = {
            ...rest,
            workspaceId,
            ...(description && { description })
        }

        mutate({ json: payload }, {
            onSuccess: () => {
                form.reset();
                onCancel?.()
            }
        })
    }

    return (
        <Card className="w-full h-full border-none shadow-none">
            {/* <CardHeader className="flex p-7">
                <CardTitle className="text-xl font-bold">
                    Create a new task
                </CardTitle>
            </CardHeader> */}
            {/* <Separator /> */}
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
                                    name='assigneeId'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('assignee')}
                                            </FormLabel>
                                            <Select
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="!mt-0">
                                                        <SelectValue placeholder={t('select-assignee')} />
                                                    </SelectTrigger>
                                                </FormControl >
                                                <FormMessage />
                                                <SelectContent >
                                                    {memberOptions?.map(member => (
                                                        <SelectItem key={member.id} value={member.id}>
                                                            <div className="flex items-center gap-x-2">
                                                                <MemberAvatar
                                                                    className='size-6'
                                                                    name={member.name}
                                                                />
                                                                {member.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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
                                                    {TASK_STATUS_OPTIONS.map((status) => (
                                                        <SelectItem key={status.value} value={status.value}>
                                                            <div className="flex items-center gap-x-2">
                                                                <div className={cn("size-3 rounded-full", status.color)} />
                                                                {t(status.translationKey)}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
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
                                                    {...field}
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