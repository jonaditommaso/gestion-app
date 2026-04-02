'use client'
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import RichTextArea from "@/components/RichTextArea";
import { Task, TaskMetadata, SpikeFinding } from "../types";
import { parseTaskMetadata, stringifyTaskMetadata } from "../utils/metadata-helpers";
import { useUpdateTask } from "../api/use-update-task";
import { checkEmptyContent } from "@/utils/checkEmptyContent";
import { cn } from "@/lib/utils";
import { CheckCircle2Icon, XCircleIcon, SearchIcon, PlusIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es, enUS, it } from "date-fns/locale";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";

type ConclusionType = NonNullable<TaskMetadata['spikeConclusionType']>;

interface SpikePanelProps {
    task: Task;
    readOnly?: boolean;
}

const PROSE_CLASS = "prose prose-sm max-w-none dark:prose-invert [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6";

const DATE_LOCALES = { es, en: enUS, it };

const CONCLUSION_TYPE_OPTIONS: {
    value: ConclusionType;
    translationKey: 'spike-conclusion-type-adopt' | 'spike-conclusion-type-reject' | 'spike-conclusion-type-investigate';
    icon: React.ElementType;
    activeClass: string;
    bgClass: string;
}[] = [
    {
        value: 'adopt',
        translationKey: 'spike-conclusion-type-adopt',
        icon: CheckCircle2Icon,
        activeClass: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
        bgClass: 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
    },
    {
        value: 'reject',
        translationKey: 'spike-conclusion-type-reject',
        icon: XCircleIcon,
        activeClass: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
        bgClass: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
    },
    {
        value: 'investigate',
        translationKey: 'spike-conclusion-type-investigate',
        icon: SearchIcon,
        activeClass: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
        bgClass: 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800',
    },
];

export const SpikePanel = ({ task, readOnly = false }: SpikePanelProps) => {
    const t = useTranslations('workspaces');
    const locale = useLocale() as 'es' | 'en' | 'it';
    const { mutate: updateTask, isPending } = useUpdateTask();

    const metadata = parseTaskMetadata(task.metadata);
    const findings: SpikeFinding[] = Array.isArray(metadata.spikeFindings) ? metadata.spikeFindings : [];

    const [isAddingFinding, setIsAddingFinding] = useState(false);
    const [newFinding, setNewFinding] = useState('');

    const [isEditingConclusion, setIsEditingConclusion] = useState(false);
    const [conclusion, setConclusion] = useState(metadata.spikeConclusion || '');
    const [showTypePrompt, setShowTypePrompt] = useState(false);

    const currentConclusion = metadata.spikeConclusion;
    const currentConclusionType = metadata.spikeConclusionType;
    const conclusionTypeOpt = CONCLUSION_TYPE_OPTIONS.find(o => o.value === currentConclusionType);

    const handleAddFinding = () => {
        if (checkEmptyContent(newFinding) || isPending) return;
        const currentMetadata = parseTaskMetadata(task.metadata);
        const currentFindings: SpikeFinding[] = Array.isArray(currentMetadata.spikeFindings)
            ? currentMetadata.spikeFindings
            : [];
        const newEntry: SpikeFinding = {
            id: Date.now().toString(),
            content: newFinding,
            createdAt: new Date().toISOString(),
        };
        updateTask(
            {
                json: {
                    metadata: stringifyTaskMetadata({
                        ...currentMetadata,
                        spikeFindings: [...currentFindings, newEntry],
                    }),
                },
                param: { taskId: task.$id },
            },
            {
                onSuccess: () => {
                    setNewFinding('');
                    setIsAddingFinding(false);
                },
            }
        );
    };

    const handleSaveConclusion = () => {
        const currentMetadata = parseTaskMetadata(task.metadata);
        const newConclusion = checkEmptyContent(conclusion) ? undefined : conclusion;
        updateTask(
            {
                json: { metadata: stringifyTaskMetadata({ ...currentMetadata, spikeConclusion: newConclusion }) },
                param: { taskId: task.$id },
            },
            {
                onSuccess: () => {
                    setIsEditingConclusion(false);
                    // Only prompt if there's actual content and no type set yet
                    if (newConclusion && !currentMetadata.spikeConclusionType) {
                        setShowTypePrompt(true);
                    }
                },
            }
        );
    };

    const handleConclusionTypeChange = (type: ConclusionType) => {
        if (readOnly || isPending) return;
        const currentMetadata = parseTaskMetadata(task.metadata);
        const newType = currentMetadata.spikeConclusionType === type ? undefined : type;
        updateTask({
            json: { metadata: stringifyTaskMetadata({ ...currentMetadata, spikeConclusionType: newType }) },
            param: { taskId: task.$id },
        });
        setShowTypePrompt(false);
    };

    return (
        <div className="space-y-6">
            {/* Findings timeline */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold">{t('spike-findings')}</h3>
                    {!readOnly && !isAddingFinding && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsAddingFinding(true)}
                            className="h-7 text-xs gap-1"
                        >
                            <PlusIcon className="size-3" />
                            {t('spike-add-finding')}
                        </Button>
                    )}
                </div>

                <div className="space-y-3">
                    {findings.length === 0 && !isAddingFinding && (
                        <p className="text-muted-foreground text-sm p-4 border rounded-lg bg-muted/30">
                            {t('spike-finding-empty')}
                        </p>
                    )}

                    {findings.map((finding) => (
                        <div
                            key={finding.id}
                            className="p-4 rounded-lg border bg-card"
                        >
                            <div className="flex items-start justify-between gap-x-4 mb-2">
                                <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                                    {formatDistanceToNow(new Date(finding.createdAt), {
                                        addSuffix: true,
                                        locale: DATE_LOCALES[locale],
                                    })}
                                </span>
                            </div>
                            <div
                                className={PROSE_CLASS}
                                dangerouslySetInnerHTML={{ __html: finding.content }}
                            />
                        </div>
                    ))}

                    {!readOnly && isAddingFinding && (
                        <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
                            <RichTextArea
                                value={newFinding}
                                onChange={setNewFinding}
                                placeholder={t('spike-finding-placeholder')}
                            />
                            <div className="flex items-center gap-x-2">
                                <Button
                                    size="sm"
                                    onClick={handleAddFinding}
                                    disabled={isPending || checkEmptyContent(newFinding) || !newFinding}
                                >
                                    {t('save')}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddingFinding(false);
                                        setNewFinding('');
                                    }}
                                    disabled={isPending}
                                >
                                    {t('cancel')}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Conclusion */}
            <div>
                <div className="flex items-center gap-x-3 mb-3">
                    <h3 className="text-base font-semibold">{t('spike-conclusion')}</h3>
                    {!readOnly && !isEditingConclusion && (
                        <div className="flex items-center gap-x-1.5">
                            {CONCLUSION_TYPE_OPTIONS.map(({ value, translationKey, icon: Icon, activeClass }) => (
                                <button
                                    key={value}
                                    onClick={() => handleConclusionTypeChange(value)}
                                    disabled={isPending}
                                    className={cn(
                                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                                        currentConclusionType === value
                                            ? activeClass
                                            : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                                    )}
                                >
                                    <Icon className="size-3" />
                                    {t(translationKey)}
                                </button>
                            ))}
                        </div>
                    )}
                    {readOnly && conclusionTypeOpt && (() => {
                        const Icon = conclusionTypeOpt.icon;
                        return (
                            <span className={cn(
                                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border",
                                conclusionTypeOpt.activeClass
                            )}>
                                <Icon className="size-3" />
                                {t(conclusionTypeOpt.translationKey)}
                            </span>
                        );
                    })()}
                </div>

                <Popover open={showTypePrompt} onOpenChange={setShowTypePrompt}>
                    <PopoverAnchor asChild>
                        <div>
                            {!readOnly && isEditingConclusion ? (
                                <div className="space-y-3">
                                    <RichTextArea
                                        value={conclusion}
                                        onChange={setConclusion}
                                        placeholder={t('click-add-conclusion')}
                                    />
                                    <div className="flex items-center gap-x-2">
                                        <Button size="sm" onClick={handleSaveConclusion} disabled={isPending}>
                                            {t('save')}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditingConclusion(false);
                                                setConclusion(metadata.spikeConclusion || '');
                                            }}
                                            disabled={isPending}
                                        >
                                            {t('cancel')}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={cn(
                                        "p-4 rounded-lg transition-all min-h-[60px]",
                                        !readOnly && "cursor-pointer",
                                        currentConclusion ? [
                                            conclusionTypeOpt?.bgClass ?? 'hover:bg-muted/30',
                                            !readOnly && !conclusionTypeOpt && 'hover:bg-muted/30',
                                        ] : (!readOnly ? 'border bg-muted/30 hover:bg-muted/50' : '')
                                    )}
                                    onClick={readOnly ? undefined : () => setIsEditingConclusion(true)}
                                >
                                    {currentConclusion ? (
                                        <div
                                            className={PROSE_CLASS}
                                            dangerouslySetInnerHTML={{ __html: currentConclusion }}
                                        />
                                    ) : (
                                        <p className="text-muted-foreground text-sm">
                                            {readOnly ? t('no-conclusion') : t('click-add-conclusion')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </PopoverAnchor>
                    <PopoverContent className="w-auto p-4" side="top" align="start">
                        <p className="text-sm font-medium mb-3">{t('spike-conclusion-type-prompt')}</p>
                        <div className="flex items-center gap-x-2 flex-wrap gap-y-2">
                            {CONCLUSION_TYPE_OPTIONS.map(({ value, translationKey, icon: Icon, activeClass }) => (
                                <button
                                    key={value}
                                    onClick={() => handleConclusionTypeChange(value)}
                                    className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                                        currentConclusionType === value
                                            ? activeClass
                                            : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                                    )}
                                >
                                    <Icon className="size-3.5" />
                                    {t(translationKey)}
                                </button>
                            ))}
                            <button
                                onClick={() => setShowTypePrompt(false)}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
                            >
                                {t('skip')}
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
};
