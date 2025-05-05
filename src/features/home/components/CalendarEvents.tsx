'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
//import { Tabs, TabsContent,  } from "@/components/ui/tabs"; //TabsList, TabsTrigger
import { useLocale, useTranslations } from "next-intl";
import { useGetMeets } from "../api/use-get-meets";
import dayjs from "dayjs";
import 'dayjs/locale/es'
import 'dayjs/locale/en'
import 'dayjs/locale/it'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import capitalize from '@/utils/capitalize';
import { Skeleton } from "@/components/ui/skeleton";

const CalendarEvents = () => {
    const t = useTranslations('home');
    const { data, isLoading } = useGetMeets();
    const locale = useLocale();

    dayjs.extend(localizedFormat)
    dayjs.extend(utc)
    dayjs.extend(timezone)
    dayjs.locale(locale)
    const timeZone = dayjs.tz.guess()

    return (
        <Card className="col-span-1 max-w-lg bg-sidebar-accent">
            {/* <Tabs defaultValue="own"> */}
                <CardHeader className="flex justify-between flex-row">
                    <div className="pt-1">
                        <CardTitle>{t('calendar-events')}</CardTitle>
                        <CardDescription>{t('upcoming-events')}</CardDescription>
                    </div>
                    {/* <TabsList className="mt-0">
                        <TabsTrigger value="own">Mis eventos</TabsTrigger>
                        <TabsTrigger value="team">Vatican Pancho</TabsTrigger>
                    </TabsList> */}
                </CardHeader>
                {/* <TabsContent value=""> */}
                    <CardContent className="grid gap-4">
                        {isLoading ?
                            Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="p-2 rounded-md h-12" />)
                            : (
                            data?.map(meet => (
                                <div className="border bg-sidebar p-2 rounded-md" key={meet.$id}>
                                    <p className="font-medium text-sm">{meet.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                    {capitalize(dayjs.utc(meet.date).tz(timeZone).format('dddd D [de] MMMM, h:mm A'))} {t('with')} <span className="italic font-medium">{meet.with} </span>
                                        (<relative-time lang={locale} datetime={meet.date} className="text-muted-foreground text-xs">
                                        </relative-time>)
                                    </p>
                                    <p className="text-xs hover:underline text-blue-400 cursor-pointer" onClick={() => window.open(meet.url, '_blank')}>{meet.url}</p>
                                </div>
                            ))
                        )}
                    </CardContent>
                {/* </TabsContent> */}
                {/* <TabsContent value="team">
                    <CardContent className="grid gap-4">
                        <div className="border bg-sidebar p-2 rounded-md">
                            <p className="font-medium">Terminar seccion de inicio</p>
                            <p className="text-sm text-muted-foreground">Creada el 24/03/2024</p>
                        </div>
                        <div className="border bg-sidebar p-2 rounded-md">
                            <p className="font-medium">Terminar seccion de inicio</p>
                            <p className="text-sm text-muted-foreground">Creada el 24/03/2024</p>
                        </div>
                        <div className="border bg-sidebar p-2 rounded-md">
                            <p className="font-medium">Terminar seccion de inicio</p>
                            <p className="text-sm text-muted-foreground">Creada el 24/03/2024</p>
                        </div>
                    </CardContent>
                </TabsContent> */}
            {/* </Tabs> */}
        </Card>
    );
}

export default CalendarEvents;