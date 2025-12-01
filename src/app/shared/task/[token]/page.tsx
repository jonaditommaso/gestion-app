'use client'

import { useParams } from "next/navigation";
import { useGetSharedTask } from "@/features/tasks/api/use-get-shared-task";
import CustomLoader from "@/components/CustomLoader";
import TaskDetails, { TaskTitleEditor } from "@/features/tasks/components/TaskDetails";
import { useTranslations } from "next-intl";
import { AlertCircle, Clock } from "lucide-react";
import { useCurrent } from "@/features/auth/api/use-current";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const SharedTaskPage = () => {
    const params = useParams();
    const token = params.token as string;
    const t = useTranslations('workspaces');
    const { data: currentUser } = useCurrent();

    const { data, isLoading, error } = useGetSharedTask({ token });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <CustomLoader />
            </div>
        );
    }

    if (error) {
        const isExpired = error.message === 'Link expired';

        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30">
                <div className="text-center space-y-4 p-8">
                    <div className="flex justify-center">
                        {isExpired ? (
                            <Clock className="size-16 text-muted-foreground" />
                        ) : (
                            <AlertCircle className="size-16 text-muted-foreground" />
                        )}
                    </div>
                    <h1 className="text-2xl font-semibold">
                        {isExpired ? t('link-expired') : t('share-not-found')}
                    </h1>
                    <p className="text-muted-foreground max-w-md text-balance">
                        {isExpired
                            ? t('link-expired-description')
                            : t('share-not-found-description')
                        }
                    </p>
                    <div className="pt-4">
                        {currentUser ? (
                            <Link href="/">
                                <Button>
                                    {t('back-to-home')}
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/" className="inline-flex items-center gap-3">
                                <Image
                                    src="/gestionate-logo.svg"
                                    height={24}
                                    width={24}
                                    alt="gestionate-logo"
                                />
                                <Button>
                                    {t('visit-gestionate')}
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { task, readOnly } = data;

    return (
        <div className={`min-h-screen bg-muted/30 ${currentUser ? 'pt-14' : ''}`}>
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Banner de solo lectura */}
                {readOnly && (
                    <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm text-amber-700 dark:text-amber-300 text-center">
                            {t('viewing-read-only')}
                        </p>
                    </div>
                )}

                {/* Header */}
                <div className="mb-6">
                    <TaskTitleEditor
                        taskId={task.$id}
                        initialTitle={task.name}
                        initialType={task.type}
                        size="page"
                        readOnly={readOnly}
                    />
                </div>

                {/* Content */}
                <TaskDetails task={task} readOnly={readOnly} />
            </div>
        </div>
    );
};

export default SharedTaskPage;
