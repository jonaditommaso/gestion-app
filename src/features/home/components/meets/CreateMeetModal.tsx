'use client'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { useAppContext } from "@/context/AppContext";
import dayjs from "dayjs";
import { useCreateMeet } from "../../api/use-create-meet";
import { useGetMeetAuthUrl } from "../../api/use-get-meet-auth-url";
import { useTranslations } from "next-intl";
import { CheckCircle, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

type TeamMember = {
    $id: string;
    name: string;
    email: string;
    userId: string;
};

interface CreateMeetModalProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    team: TeamMember[] | undefined
}

const getDefaultTime = (): Date => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    now.setSeconds(0);
    now.setMilliseconds(0);
    now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5);
    return now;
};

const CreateMeetModal = ({ isOpen, setIsOpen, team }: CreateMeetModalProps) => {
    const { mutate: createMeet, isPending } = useCreateMeet();
    const { currentUser: user } = useAppContext();
    const t = useTranslations('home');
    const queryClient = useQueryClient();

    const [isTimeExpired, setIsTimeExpired] = useState(false);
    // Captures scope state at dialog open time (null = modal not yet opened)
    const [initialScopeOnOpen, setInitialScopeOnOpen] = useState<boolean | null>(null);
    const scopeAtOpenRef = useRef<boolean>(false);

    const hasCalendarScope = user?.prefs?.google_calendar_scope === true;
    const showPermissionStep = initialScopeOnOpen === false;
    const permissionJustGranted = showPermissionStep && hasCalendarScope;
    const formDisabled = showPermissionStep && !hasCalendarScope;

    const { data: authUrlData } = useGetMeetAuthUrl({ enabled: isOpen && formDisabled });

    const authWindowRef = useRef<Window | null>(null);

    const form = useForm<zod.infer<typeof meetSchemaForm>>({
        resolver: zodResolver(meetSchemaForm),
        defaultValues: {
            invited: '',
            title: '',
            dateStart: getDefaultTime(),
            timeStart: getDefaultTime(),
            duration: '30-minute'
        }
    });

    const watchedDateStart = form.watch('dateStart');
    const watchedTimeStart = form.watch('timeStart');

    // Capture scope state on open, reset on close
    useEffect(() => {
        if (isOpen) {
            scopeAtOpenRef.current = user?.prefs?.google_calendar_scope === true;
            setInitialScopeOnOpen(scopeAtOpenRef.current);
            const defaultTime = getDefaultTime();
            form.reset({
                invited: '',
                title: '',
                dateStart: defaultTime,
                timeStart: defaultTime,
                duration: '30-minute'
            });
            setIsTimeExpired(false);
        } else {
            setInitialScopeOnOpen(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Refetch user when tab regains focus (after OAuth in new tab)
    useEffect(() => {
        if (!isOpen) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                queryClient.invalidateQueries({ queryKey: ['current'] });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isOpen, queryClient]);

    // Reactive time expiry check
    useEffect(() => {
        if (!isOpen) return;

        const time = dayjs(watchedTimeStart);
        const combined = dayjs(watchedDateStart)
            .set('hour', time.hour())
            .set('minute', time.minute())
            .set('second', 0)
            .set('millisecond', 0);

        setIsTimeExpired(combined.isBefore(dayjs()));

        if (combined.isAfter(dayjs())) {
            const msUntilExpiry = combined.diff(dayjs()) + 1000;
            const timer = setTimeout(() => {
                setIsTimeExpired(true);
            }, msUntilExpiry);
            return () => clearTimeout(timer);
        }
    }, [isOpen, watchedDateStart, watchedTimeStart]);

    const handleAuthorize = () => {
        if (!authUrlData?.data) return;
        authWindowRef.current = window.open(authUrlData.data, '_blank');
    };

    const onSubmit = (values: zod.infer<typeof meetSchemaForm>) => {
        const time = dayjs(values.timeStart);
        const combined = dayjs(values.dateStart)
            .set('hour', time.hour())
            .set('minute', time.minute())
            .set('second', time.second())
            .set('millisecond', time.millisecond());

        const dateStart = combined.toDate();

        const finalValues = {
            title: values.title,
            invited: values.invited,
            duration: values.duration,
            dateStart: dateStart,
            userId: user?.$id || ''
        };

        createMeet({ json: finalValues }, {
            onSuccess: () => {
                form.reset();
            }
        });
        setIsOpen(false);
    };

    const onCancel = () => {
        form.reset();
        setIsOpen(false);
    };

    return (
        <DialogContainer isOpen={isOpen} setIsOpen={onCancel} title={t('set-up-metting')}>

            {showPermissionStep && (
                <>
                    {permissionJustGranted ? (
                        <Alert variant="success" className="mb-4">
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>{t('calendar-permission-granted')}</AlertTitle>
                            <AlertDescription>{t('calendar-permission-granted-description')}</AlertDescription>
                        </Alert>
                    ) : (
                        <div className="rounded-lg border bg-muted/40 p-4 mb-4">
                            <div className="flex items-center gap-3 mb-3">
                                <Image src="/logos/g-calendar-logo.png" alt="Google Calendar" width={28} height={28} />
                                <Image src="/logos/g-meet-logo.png" alt="Google Meet" width={28} height={28} />
                                <span className="font-medium text-sm">{t('calendar-permission-title')}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{t('calendar-permission-description')}</p>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleAuthorize}
                                disabled={!authUrlData?.data}
                                className="gap-2"
                            >
                                <Image src="/logos/g-calendar-logo.png" alt="Google" width={16} height={16} />
                                {t('calendar-authorize-button')}
                            </Button>
                        </div>
                    )}
                    <Separator className="mb-4" />
                </>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <fieldset disabled={formDisabled} className={cn(formDisabled && 'opacity-50 pointer-events-none')}>
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
                    </fieldset>

                    {isTimeExpired && !formDisabled && (
                        <Alert variant="warning" className="mt-4">
                            <TriangleAlert className="h-4 w-4" />
                            <AlertDescription>
                                {t('meet-time-expired-warning')}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Separator className="my-4" />

                    <div className="flex items-center gap-2 justify-center p-2">
                        <Button className="w-full" variant='outline' size='sm' type="button" onClick={onCancel} disabled={isPending}>{t('cancel')}</Button>
                        <Button className="w-full" size='sm' type="submit" disabled={isPending || isTimeExpired || formDisabled}>{t('schedule-meet')}</Button>
                    </div>
                </form>
            </Form>
        </DialogContainer>
    );
}

export default CreateMeetModal;