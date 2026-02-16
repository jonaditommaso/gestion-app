'use client'

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardX } from "lucide-react";
import { useTranslations } from "next-intl";

const TaskNotFoundPage = () => {
    const params = useParams();
    const t = useTranslations('task-not-found');
    const workspaceId = params.workspaceId as string;

    return (
        <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center px-6 py-10 bg-gradient-to-br from-background via-background to-muted/20">
            <div className="w-full max-w-2xl rounded-2xl border bg-card/60 backdrop-blur-sm p-8 md:p-10 text-center shadow-sm">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <ClipboardX className="size-8 text-muted-foreground" />
                </div>

                <p className="text-sm font-medium text-muted-foreground mb-2">404</p>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
                    {t('title')}
                </h1>

                <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-8">
                    {t('description')}
                </p>

                <Button asChild size="lg" className="gap-2">
                    <Link href={`/workspaces/${workspaceId}`}>
                        <ArrowLeft className="size-4" />
                        {t('button-workspace')}
                    </Link>
                </Button>
            </div>
        </div>
    );
}

export default TaskNotFoundPage;