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
import { TaskStatus } from "../types";
import MemberAvatar from "@/features/members/components/MemberAvatar";

interface CreateTaskFormProps {
    memberOptions?: { id: string, name: string }[],
    onCancel: () => void
}


const CreateTaskForm = ({ onCancel, memberOptions }: CreateTaskFormProps) => {
    const { mutate, isPending } = useCreateTask();
    const workspaceId = useWorkspaceId()

    const form = useForm<zod.infer<typeof createTaskSchema>>({
        resolver: zodResolver(createTaskSchema.omit({ workspaceId: true })),
        defaultValues: {
            workspaceId
        }
    })

    const onSubmit = (values: zod.infer<typeof createTaskSchema>) => {

        mutate({ json: {...values, workspaceId} }, {
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
                                            Task name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter task name"
                                                className="!mt-0"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='dueDate'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Due Date
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
                            <FormField
                                control={form.control}
                                name='assigneeId'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Assignee
                                        </FormLabel>
                                        <Select
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="!mt-0">
                                                    <SelectValue placeholder='Select assignee' />
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
                                name='status'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Status
                                        </FormLabel>
                                        <Select
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="!mt-0">
                                                    <SelectValue placeholder='Select status' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <FormMessage />
                                            {/*  REFACTOR THIS! */}
                                            <SelectContent>
                                                <SelectItem value={TaskStatus.BACKLOG}>
                                                    Backlog
                                                </SelectItem>
                                                <SelectItem value={TaskStatus.IN_PROGRESS}>
                                                    In Progress
                                                </SelectItem>
                                                <SelectItem value={TaskStatus.IN_REVIEW}>
                                                    In Review
                                                </SelectItem>
                                                <SelectItem value={TaskStatus.TODO}>
                                                    Todo
                                                </SelectItem>
                                                <SelectItem value={TaskStatus.DONE}>
                                                    Done
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
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
                                Cancelar
                            </Button>
                            <Button
                                type='submit'
                                size='lg'
                                disabled={isPending}
                            >
                                Crear task
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export default CreateTaskForm;