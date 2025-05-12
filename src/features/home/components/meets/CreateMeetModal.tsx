'use client'
import { DialogContainer } from "@/components/DialogContainer";
import CustomTimePicker from "@/components/timePicker/CustomTimePicker";
import DurationSelector from "../DurationSelector";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CustomDatePicker from "@/components/CustomDatePicker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z as zod } from 'zod';
import { meetSchemaForm } from "../../schemas";
import { useCurrent } from "@/features/auth/api/use-current";
import dayjs from "dayjs";
import { useCreateMeet } from "../../api/use-create-meet";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";
import { Models } from "node-appwrite";

interface CreateMeetModalProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    team: (Models.Membership & Models.User<Models.Preferences>)[] | undefined
}

const CreateMeetModal = ({ isOpen, setIsOpen, team }: CreateMeetModalProps) => {
    const { mutate: createMeet, isPending } = useCreateMeet();
    const { data: user } = useCurrent();
    const t = useTranslations('home');

    const form = useForm<zod.infer<typeof meetSchemaForm>>({
        resolver: zodResolver(meetSchemaForm),
        defaultValues: {
            invited: '',
            title: '',
            dateStart: new Date(),
            timeStart: new Date(),
            duration: '30-minute'
        }
    });

    const onSubmit = (values: zod.infer<typeof meetSchemaForm>) => {
        const time = dayjs(values.timeStart);
        const combined = dayjs(values.dateStart)
            .set('hour', time.hour())
            .set('minute', time.minute())
            .set('second', time.second())
            .set('millisecond', time.millisecond());

        const dateStart = combined.toDate()

        const finalValues = {
            title: values.title,
            invited: values.invited,
            duration: values.duration,
            dateStart: dateStart,
            userId: user?.$id || ''
        }

        createMeet({ json: finalValues }, {
            onSuccess: () => {
                form.reset();
            }
        })
        setIsOpen(false);
    }

    const onCancel = () => {
        form.reset();
        setIsOpen(false);
    }

    return (
        <DialogContainer isOpen={isOpen} setIsOpen={onCancel} title={t('set-up-metting')}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        name="title"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="w-full m-auto">
                                <Label>{t('meet-title')}</Label>
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder={t('weekly-meeting')}
                                        className="!mt-0"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="invited"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="w-full m-auto mt-8">
                                <FormLabel>{t('invited')}</FormLabel>
                                <div className="flex flex-wrap gap-4 !mt-0">
                                    {team?.map(member => {
                                        if (member.email === user?.email) return null;

                                        const isSelected = field.value === member.email;

                                        return (
                                            <FormItem key={member.$id}>
                                                <FormControl>
                                                    <div className={cn("border rounded-md", isSelected && 'border-transparent')}>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => field.onChange(member.email)}
                                                            className={cn(
                                                                "h-[50px] cursor-pointer w-[160px] p-6 flex flex-col gap-1 border-2 min-w-fit",
                                                                isSelected ? "border-blue-600" : 'border-transparent'
                                                            )}
                                                        >
                                                        <span className="text-sm">{member.name}</span>
                                                        <span className="text-xs text-muted-foreground">{member.email}</span>
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        );
                                    })}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex items-center justify-between gap-4">
                        <FormField
                            control={form.control}
                            name='dateStart'
                            render={({ field }) => (
                                <FormItem className="w-[90%] m-auto mt-8">
                                    <FormLabel>
                                        {t('date')}
                                    </FormLabel>
                                    <FormControl>
                                        <CustomDatePicker
                                            {...field}
                                            onChange={(date) => field.onChange(date)}
                                            className="!mt-0"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='timeStart'
                            render={({ field }) => (
                                <FormItem className="w-[90%] m-auto mt-8">
                                    <FormLabel>
                                        {t('time')}
                                    </FormLabel>
                                    <FormControl>
                                    <CustomTimePicker
                                        {...field}
                                        date={field.value}
                                        className="!mt-0"
                                        setDate={(date) => field.onChange(date)}
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                            <FormField
                            control={form.control}
                            name='duration'
                            render={({ field }) => (
                                <FormItem className="w-[90%] m-auto mt-8">
                                    <FormLabel>
                                        {t('duration')}
                                    </FormLabel>
                                    <FormControl>
                                        <DurationSelector
                                            value={field.value}
                                            setValue={(duration: string) => field.onChange(duration)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center gap-2 justify-center p-2">
                        <Button className="w-full" variant='outline' size='sm' type="button" onClick={onCancel} disabled={isPending}>{t('cancel')}</Button>
                        <Button className="w-full" size='sm' type="submit" disabled={isPending}>{t('add')}</Button>
                    </div>
                </form>
            </Form>
        </DialogContainer>
    );
}

export default CreateMeetModal;