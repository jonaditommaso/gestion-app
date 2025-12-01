'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useTranslations } from "next-intl";
import { TaskStatus } from '../../tasks/types';
import { useGetMember } from "@/features/members/api/use-get-member";
import { useLocale } from "next-intl";

const ToDoTasksWidget = () => {
    const {data: member} = useGetMember();
    const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
        workspaceId: member?.workspaceId,
        status: TaskStatus.TODO,
        enabled: !!member?.workspaceId
    });
    const t = useTranslations('home');
    const locale = useLocale();

    return (
        //! put overflow or remove max-h
        <Card className="col-span-1 max-h-[355px]">
            <CardHeader>
                <CardTitle>{t('todo-tasks')}</CardTitle>
                <CardDescription>{t('from-workspace')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {isLoadingTasks
                    ? (
                        Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="p-2 rounded-md h-12" />)
                    ) : (
                        tasks?.documents.map(task => (
                            <div className="border bg-sidebar-accent p-2 rounded-md border-l-red-500 border-l-4" key={task.$id}>
                                <p className="font-medium">{task.name}</p>
                                <p className="text-sm text-muted-foreground">{t('limit-date')}: <relative-time lang={locale} datetime={task.dueDate}></relative-time></p>
                            </div>
                        ))
                    )
                }
            </CardContent>
        </Card>
    );
}

export default ToDoTasksWidget;