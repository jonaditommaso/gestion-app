'use client'
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import RichTextArea from "@/components/RichTextArea";
import { Task, TaskMetadata, TaskStatus } from "../types";
import { parseTaskMetadata, stringifyTaskMetadata } from "../utils/metadata-helpers";
import { useUpdateTask } from "../api/use-update-task";
import { useCreateTask } from "../api/use-create-task";
import { TASK_TYPE_OPTIONS } from "../constants/type";
import { checkEmptyContent } from "@/utils/checkEmptyContent";
import { cn } from "@/lib/utils";
import {
    FlaskConicalIcon,
    ExternalLinkIcon,
    UnlinkIcon,
    PlusIcon,
    CheckCircle2Icon,
    XCircleIcon,
} from "lucide-react";
import { useGetTask } from "../api/use-get-task";

interface BugPanelProps {
    task: Task;
    readOnly?: boolean;
}

const PROSE_CLASS = "prose prose-sm max-w-none dark:prose-invert [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6";

export const BugPanel = ({ task, readOnly = false }: BugPanelProps) => {
    const t = useTranslations('workspaces');
    const { mutate: updateTask, isPending } = useUpdateTask();
    const { mutateAsync: createTaskAsync, isPending: isCreating } = useCreateTask();

    const metadata = parseTaskMetadata(task.metadata);

    const [editingField, setEditingField] = useState<'expected' | 'actual' | null>(null);
    const [expectedDraft, setExpectedDraft] = useState(metadata.bugExpected || '');
    const [actualDraft, setActualDraft] = useState(metadata.bugActual || '');
    const [isEditingRootCause, setIsEditingRootCause] = useState(false);
    const [rootCauseDraft, setRootCauseDraft] = useState(metadata.bugRootCause || '');

    const { data: linkedTaskData } = useGetTask({
        taskId: task.linkedTaskId ?? '',
        enabled: !!task.linkedTaskId,
    });

    const saveMetadata = (updates: Partial<TaskMetadata>) => {
        const current = parseTaskMetadata(task.metadata);
        updateTask({
            json: { metadata: stringifyTaskMetadata({ ...current, ...updates }) },
            param: { taskId: task.$id },
        });
    };

    const handleSaveExpected = () => {
        const value = checkEmptyContent(expectedDraft) ? undefined : expectedDraft;
        saveMetadata({ bugExpected: value });
        setEditingField(null);
    };

    const handleSaveActual = () => {
        const value = checkEmptyContent(actualDraft) ? undefined : actualDraft;
        saveMetadata({ bugActual: value });
        setEditingField(null);
    };

    const handleSaveRootCause = () => {
        const value = rootCauseDraft.trim() || undefined;
        saveMetadata({ bugRootCause: value });
        setIsEditingRootCause(false);
    };

    const handleCreateTestTask = async () => {
        if (isCreating || isPending) return;
        const result = await createTaskAsync({
            json: {
                name: `Test: ${task.name}`,
                workspaceId: task.workspaceId,
                status: TaskStatus.BACKLOG,
                priority: 3,
                type: 'test',
                linkedTaskId: task.$id,
            },
        });
        const newTaskId = (result as { data?: { $id?: string } }).data?.$id;
        if (newTaskId) {
            updateTask({ json: { linkedTaskId: newTaskId }, param: { taskId: task.$id } });
        }
    };

    const handleUnlinkTask = () => {
        if (isPending) return;
        updateTask({ json: { linkedTaskId: null }, param: { taskId: task.$id } });
    };

    const currentExpected = parseTaskMetadata(task.metadata).bugExpected;
    const currentActual = parseTaskMetadata(task.metadata).bugActual;
    const currentRootCause = parseTaskMetadata(task.metadata).bugRootCause;

    return (
        <div className="space-y-6">
            {/* Expected vs Actual */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Expected */}
                <div>
                    <div className="flex items-center gap-1.5 mb-2">
                        <CheckCircle2Icon className="size-3.5 text-green-600 dark:text-green-400" />
                        <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">
                            {t('bug-expected')}
                        </h3>
                    </div>
                    {!readOnly && editingField === 'expected' ? (
                        <div className="space-y-2">
                            <RichTextArea
                                value={expectedDraft}
                                onChange={setExpectedDraft}
                                placeholder={t('bug-click-add-expected')}
                            />
                            <div className="flex items-center gap-2">
                                <Button size="sm" onClick={handleSaveExpected} disabled={isPending}>
                                    {t('save')}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => {
                                    setEditingField(null);
                                    setExpectedDraft(currentExpected || '');
                                }} disabled={isPending}>
                                    {t('cancel')}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={cn(
                                "p-3 rounded-lg min-h-[80px] transition-all text-sm",
                                currentExpected
                                    ? "border border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-950/10"
                                    : "border bg-muted/30",
                                !readOnly && "cursor-pointer hover:bg-muted/50"
                            )}
                            onClick={readOnly ? undefined : () => {
                                setExpectedDraft(currentExpected || '');
                                setEditingField('expected');
                            }}
                        >
                            {currentExpected ? (
                                <div className={PROSE_CLASS} dangerouslySetInnerHTML={{ __html: currentExpected }} />
                            ) : (
                                <p className="text-muted-foreground text-sm">
                                    {readOnly ? t('bug-no-expected') : t('bug-click-add-expected')}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Actual */}
                <div>
                    <div className="flex items-center gap-1.5 mb-2">
                        <XCircleIcon className="size-3.5 text-red-500 dark:text-red-400" />
                        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
                            {t('bug-actual')}
                        </h3>
                    </div>
                    {!readOnly && editingField === 'actual' ? (
                        <div className="space-y-2">
                            <RichTextArea
                                value={actualDraft}
                                onChange={setActualDraft}
                                placeholder={t('bug-click-add-actual')}
                            />
                            <div className="flex items-center gap-2">
                                <Button size="sm" onClick={handleSaveActual} disabled={isPending}>
                                    {t('save')}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => {
                                    setEditingField(null);
                                    setActualDraft(currentActual || '');
                                }} disabled={isPending}>
                                    {t('cancel')}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={cn(
                                "p-3 rounded-lg min-h-[80px] transition-all text-sm",
                                currentActual
                                    ? "border border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/10"
                                    : "border bg-muted/30",
                                !readOnly && "cursor-pointer hover:bg-muted/50"
                            )}
                            onClick={readOnly ? undefined : () => {
                                setActualDraft(currentActual || '');
                                setEditingField('actual');
                            }}
                        >
                            {currentActual ? (
                                <div className={PROSE_CLASS} dangerouslySetInnerHTML={{ __html: currentActual }} />
                            ) : (
                                <p className="text-muted-foreground text-sm">
                                    {readOnly ? t('bug-no-actual') : t('bug-click-add-actual')}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Root cause */}
            <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                    {t('bug-root-cause')}
                </h3>
                {!readOnly && isEditingRootCause ? (
                    <div className="space-y-2">
                        <Textarea
                            autoFocus
                            placeholder={t('bug-root-cause-placeholder')}
                            value={rootCauseDraft}
                            onChange={e => setRootCauseDraft(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Escape') {
                                    setIsEditingRootCause(false);
                                    setRootCauseDraft(currentRootCause || '');
                                }
                            }}
                            className="text-sm resize-none min-h-[72px]"
                        />
                        <div className="flex items-center gap-2">
                            <Button size="sm" onClick={handleSaveRootCause} disabled={isPending}>
                                {t('save')}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
                                setIsEditingRootCause(false);
                                setRootCauseDraft(currentRootCause || '');
                            }} disabled={isPending}>
                                {t('cancel')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div
                        className={cn(
                            "p-3 rounded-lg min-h-[48px] transition-all text-sm",
                            currentRootCause ? "border bg-muted/20" : "border bg-muted/30",
                            !readOnly && "cursor-pointer hover:bg-muted/50"
                        )}
                        onClick={readOnly ? undefined : () => {
                            setRootCauseDraft(currentRootCause || '');
                            setIsEditingRootCause(true);
                        }}
                    >
                        {currentRootCause ? (
                            <p className="whitespace-pre-wrap">{currentRootCause}</p>
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                {readOnly ? t('bug-no-root-cause') : t('bug-root-cause-placeholder')}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Linked test task */}
            <div>
                {task.linkedTaskId ? (
                    <div className="inline-flex flex-col gap-1">
                        <button
                            onClick={() => window.open(`/workspaces/${task.workspaceId}/tasks/${task.linkedTaskId}`, '_blank')}
                            className="inline-flex items-center gap-1.5 rounded-md border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/50 px-2 py-1 text-xs hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors group max-w-fit"
                            title={t('open-in-new-page')}
                        >
                            {(() => {
                                const typeOpt = TASK_TYPE_OPTIONS.find(o => o.value === (linkedTaskData?.type ?? 'test'));
                                if (!typeOpt) return null;
                                const TypeIcon = typeOpt.icon;
                                return <TypeIcon className={cn('size-3 shrink-0', typeOpt.textColor)} />;
                            })()}
                            <span className="font-medium truncate max-w-[220px]">
                                {linkedTaskData?.name ?? task.linkedTaskId}
                            </span>
                            <ExternalLinkIcon className="size-3 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                        {!readOnly && (
                            <button
                                onClick={handleUnlinkTask}
                                disabled={isPending}
                                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors w-fit"
                            >
                                <UnlinkIcon className="size-3" />
                                {t('test-unlink')}
                            </button>
                        )}
                    </div>
                ) : !readOnly ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCreateTestTask}
                        disabled={isCreating || isPending}
                        className="h-7 text-xs gap-1.5 border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20"
                    >
                        <FlaskConicalIcon className="size-3.5" />
                        <PlusIcon className="size-3" />
                        {t('bug-create-test')}
                    </Button>
                ) : null}
            </div>
        </div>
    );
};
