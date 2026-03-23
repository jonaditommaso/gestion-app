'use client'
import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Task, TaskMetadata, TestCase, TestCaseStatus, TestScenario } from "../types";
import { parseTaskMetadata, stringifyTaskMetadata } from "../utils/metadata-helpers";
import { useUpdateTask } from "../api/use-update-task";
import { useGetTask } from "../api/use-get-task";
import { useGetTasks } from "../api/use-get-tasks";
import { TASK_TYPE_OPTIONS } from "../constants/type";
import { cn } from "@/lib/utils";
import {
    CheckCircle2Icon,
    XCircleIcon,
    ClockIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    PlusIcon,
    FlaskConicalIcon,
    FolderIcon,
    FolderOpenIcon,
    ExternalLinkIcon,
    UnlinkIcon,
    XIcon,
    SearchIcon,
} from "lucide-react";

interface TestPanelProps {
    task: Task;
    readOnly?: boolean;
}

const STATUS_OPTIONS: { value: TestCaseStatus; icon: React.ElementType; className: string }[] = [
    { value: 'pending', icon: ClockIcon, className: 'text-muted-foreground' },
    { value: 'pass', icon: CheckCircle2Icon, className: 'text-green-600 dark:text-green-400' },
    { value: 'fail', icon: XCircleIcon, className: 'text-red-500 dark:text-red-400' },
];

function nextStatus(current: TestCaseStatus): TestCaseStatus {
    const cycle: TestCaseStatus[] = ['pending', 'pass', 'fail'];
    return cycle[(cycle.indexOf(current) + 1) % cycle.length];
}

export const TestPanel = ({ task, readOnly = false }: TestPanelProps) => {
    const t = useTranslations('workspaces');
    const { mutate: updateTask, isPending } = useUpdateTask();

    const metadata = parseTaskMetadata(task.metadata);
    const scenarios: TestScenario[] = Array.isArray(metadata.testScenarios) ? metadata.testScenarios : [];
    const isTdd: boolean | undefined = metadata.isTdd;

    // collapsed state per scenario (local only, not persisted)
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    // adding suite state
    const [isAddingSuite, setIsAddingSuite] = useState(false);
    const [newSuiteName, setNewSuiteName] = useState('');

    // adding case state: suiteId -> true
    const [addingCaseIn, setAddingCaseIn] = useState<string | null>(null);
    const [newCaseName, setNewCaseName] = useState('');

    // link task state
    const [isLinking, setIsLinking] = useState(false);
    const [linkSearch, setLinkSearch] = useState('');

    const { data: linkedTaskData } = useGetTask({
        taskId: task.linkedTaskId ?? '',
        enabled: !!task.linkedTaskId,
    });
    const { data: allTasksData } = useGetTasks({
        workspaceId: task.workspaceId,
        enabled: isLinking,
    });
    const allTasks = allTasksData?.documents ?? [];
    const searchTasks = linkSearch.trim().length > 0
        ? allTasks.filter(t =>
            t.$id !== task.$id &&
            t.name.toLowerCase().includes(linkSearch.toLowerCase())
          ).slice(0, 8)
        : allTasks.filter(t => t.$id !== task.$id).slice(0, 8);

    const saveMetadata = (updates: Partial<TaskMetadata>) => {
        const current = parseTaskMetadata(task.metadata);
        updateTask({
            json: { metadata: stringifyTaskMetadata({ ...current, ...updates }) },
            param: { taskId: task.$id },
        });
    };

    const handleSetTdd = (value: boolean) => {
        if (readOnly || isPending) return;
        saveMetadata({ isTdd: value });
    };

    const handleAddSuite = () => {
        if (!newSuiteName.trim() || isPending) return;
        const newScenario: TestScenario = {
            id: Date.now().toString(),
            name: newSuiteName.trim(),
            cases: [],
        };
        saveMetadata({ testScenarios: [...scenarios, newScenario] });
        setNewSuiteName('');
        setIsAddingSuite(false);
    };

    const handleAddCase = (suiteId: string) => {
        if (!newCaseName.trim() || isPending) return;
        const newCase: TestCase = {
            id: `${suiteId}-${Date.now()}`,
            name: newCaseName.trim(),
            status: 'pending',
        };
        const updated = scenarios.map(s =>
            s.id === suiteId ? { ...s, cases: [...s.cases, newCase] } : s
        );
        saveMetadata({ testScenarios: updated });
        setNewCaseName('');
        setAddingCaseIn(null);
    };

    const handleCycleStatus = (suiteId: string, caseId: string) => {
        if (readOnly || isPending) return;
        const updated = scenarios.map(s =>
            s.id === suiteId
                ? {
                    ...s,
                    cases: s.cases.map(c =>
                        c.id === caseId ? { ...c, status: nextStatus(c.status) } : c
                    ),
                }
                : s
        );
        saveMetadata({ testScenarios: updated });
    };

    const handleDeleteCase = (suiteId: string, caseId: string) => {
        if (readOnly || isPending) return;
        const updated = scenarios.map(s =>
            s.id === suiteId ? { ...s, cases: s.cases.filter(c => c.id !== caseId) } : s
        );
        saveMetadata({ testScenarios: updated });
    };

    const handleDeleteSuite = (suiteId: string) => {
        if (readOnly || isPending) return;
        saveMetadata({ testScenarios: scenarios.filter(s => s.id !== suiteId) });
    };

    const handleLinkTask = (linkedId: string) => {
        if (isPending) return;
        updateTask({ json: { linkedTaskId: linkedId }, param: { taskId: task.$id } });
        setIsLinking(false);
        setLinkSearch('');
    };

    const handleUnlinkTask = () => {
        if (isPending) return;
        updateTask({ json: { linkedTaskId: null }, param: { taskId: task.$id } });
    };

    const toggleCollapse = (suiteId: string) => {
        setCollapsed(prev => ({ ...prev, [suiteId]: !prev[suiteId] }));
    };

    const totalCases = scenarios.reduce((acc, s) => acc + s.cases.length, 0);
    const passCases = scenarios.reduce((acc, s) => acc + s.cases.filter(c => c.status === 'pass').length, 0);
    const failCases = scenarios.reduce((acc, s) => acc + s.cases.filter(c => c.status === 'fail').length, 0);

    return (
        <div className="space-y-4">
            {/* Header row: TDD/Post-fix toggle (izquierda) + summary + add suite (derecha) */}
            <div className="flex items-center justify-between gap-3">
                {/* Segmented toggle */}
                {!readOnly ? (
                    <div className="inline-flex rounded-full border overflow-hidden text-xs font-medium shrink-0">
                        <button
                            onClick={() => handleSetTdd(true)}
                            disabled={isPending}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 transition-colors",
                                isTdd === true
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                    : "text-muted-foreground hover:bg-muted/50"
                            )}
                        >
                            <FlaskConicalIcon className="size-3" />
                            {t('test-tdd')}
                        </button>
                        <button
                            onClick={() => handleSetTdd(false)}
                            disabled={isPending}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 border-l transition-colors",
                                isTdd === false
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                                    : "text-muted-foreground hover:bg-muted/50"
                            )}
                        >
                            {t('test-post-fix')}
                        </button>
                    </div>
                ) : isTdd !== undefined ? (
                    <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium",
                        isTdd
                            ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                            : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700"
                    )}>
                        <FlaskConicalIcon className="size-3" />
                        {isTdd ? t('test-tdd') : t('test-post-fix')}
                    </div>
                ) : <div />}

                {/* Right: summary + add suite */}
                <div className="flex items-center gap-2">
                    {totalCases > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <CheckCircle2Icon className="size-3 text-green-600" />
                                {passCases}
                            </span>
                            <span className="flex items-center gap-1">
                                <XCircleIcon className="size-3 text-red-500" />
                                {failCases}
                            </span>
                            <span className="flex items-center gap-1">
                                <ClockIcon className="size-3" />
                                {totalCases - passCases - failCases}
                            </span>
                        </div>
                    )}
                    {!readOnly && !isAddingSuite && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsAddingSuite(true)}
                            className="h-7 text-xs gap-1"
                            disabled={isPending}
                        >
                            <PlusIcon className="size-3" />
                            {t('test-add-suite')}
                        </Button>
                    )}
                </div>
            </div>

            {/* New suite input */}
            {!readOnly && isAddingSuite && (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/20">
                    <FolderIcon className="size-4 text-amber-500 dark:text-amber-400 shrink-0" />
                    <Input
                        autoFocus
                        placeholder={t('test-suite-placeholder')}
                        value={newSuiteName}
                        onChange={e => setNewSuiteName(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleAddSuite();
                            if (e.key === 'Escape') { setIsAddingSuite(false); setNewSuiteName(''); }
                        }}
                        className="h-7 text-sm"
                    />
                    <Button size="sm" onClick={handleAddSuite} disabled={!newSuiteName.trim() || isPending} className="h-7 text-xs shrink-0">
                        {t('add')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setIsAddingSuite(false); setNewSuiteName(''); }} className="h-7 text-xs shrink-0">
                        {t('cancel')}
                    </Button>
                </div>
            )}

            {/* Empty state */}
            {scenarios.length === 0 && !isAddingSuite && (
                <p className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/30">
                    {t('test-empty')}
                </p>
            )}

            {/* Scenarios */}
            <div className="space-y-2" role="list">
                {scenarios.map((suite) => {
                    const isCollapsed = !!collapsed[suite.id];
                    const suitePass = suite.cases.filter(c => c.status === 'pass').length;
                    const suiteFail = suite.cases.filter(c => c.status === 'fail').length;
                    return (
                        <div key={suite.id} className="rounded-lg border bg-card overflow-hidden">
                            {/* Suite header */}
                            <div
                                className="flex items-center gap-2 px-3 py-2 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => toggleCollapse(suite.id)}
                            >
                                {isCollapsed
                                    ? <ChevronRightIcon className="size-3.5 text-muted-foreground shrink-0" />
                                    : <ChevronDownIcon className="size-3.5 text-muted-foreground shrink-0" />
                                }
                                {isCollapsed
                                    ? <FolderIcon className="size-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                                    : <FolderOpenIcon className="size-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                                }
                                <span className="text-sm font-medium flex-1 truncate font-mono">{suite.name}</span>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                                    {suite.cases.length > 0 && (
                                        <>
                                            {suitePass > 0 && <span className="text-green-600 dark:text-green-400">{suitePass}✓</span>}
                                            {suiteFail > 0 && <span className="text-red-500">{suiteFail}✗</span>}
                                            <span>{suite.cases.length - suitePass - suiteFail}…</span>
                                        </>
                                    )}
                                    {!readOnly && (
                                        <button
                                            onClick={e => { e.stopPropagation(); handleDeleteSuite(suite.id); }}
                                            disabled={isPending}
                                            className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity text-muted-foreground"
                                            aria-label="delete suite"
                                        >
                                            <XIcon className="size-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Cases */}
                            <AnimatePresence initial={false}>
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    style={{ overflow: 'hidden' }}
                                >
                                <div>
                                    {suite.cases.map((testCase, caseIndex) => {
                                        const statusOpt = STATUS_OPTIONS.find(o => o.value === testCase.status)!;
                                        const Icon = statusOpt.icon;
                                        const isLastCase = caseIndex === suite.cases.length - 1;

                                        return (
                                            <div
                                                key={testCase.id}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-2 group",
                                                    !isLastCase && "border-b border-dashed border-border/50"
                                                )}
                                            >
                                                {/* Tree line */}
                                                <div className="flex items-center shrink-0 pl-4">
                                                    <span className="text-muted-foreground/40 text-xs font-mono mr-1">
                                                        {isLastCase ? '└─' : '├─'}
                                                    </span>
                                                </div>

                                                {/* Status toggle */}
                                                <button
                                                    onClick={() => handleCycleStatus(suite.id, testCase.id)}
                                                    disabled={readOnly || isPending}
                                                    className={cn(
                                                        "shrink-0 transition-transform hover:scale-110",
                                                        readOnly && "cursor-default"
                                                    )}
                                                    title={t(`test-status-${testCase.status}`)}
                                                >
                                                    <Icon className={cn("size-4", statusOpt.className)} />
                                                </button>

                                                {/* Name */}
                                                <span className={cn(
                                                    "text-sm flex-1 font-mono",
                                                    testCase.status === 'pass' && "text-muted-foreground line-through",
                                                    testCase.status === 'fail' && "text-red-600 dark:text-red-400",
                                                )}>
                                                    {testCase.name}
                                                </span>

                                                {/* Delete */}
                                                {!readOnly && (
                                                    <button
                                                        onClick={() => handleDeleteCase(suite.id, testCase.id)}
                                                        disabled={isPending}
                                                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0"
                                                        aria-label="delete case"
                                                    >
                                                        <XIcon className="size-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Add case */}
                                    {!readOnly && addingCaseIn === suite.id && (
                                        <div className="flex items-center gap-2 px-3 py-2 border-t border-dashed">
                                            <div className="flex items-center shrink-0 pl-4">
                                                <span className="text-muted-foreground/40 text-xs font-mono mr-1">└─</span>
                                            </div>
                                            <ClockIcon className="size-4 text-muted-foreground shrink-0" />
                                            <Input
                                                autoFocus
                                                placeholder={t('test-case-placeholder')}
                                                value={newCaseName}
                                                onChange={e => setNewCaseName(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') handleAddCase(suite.id);
                                                    if (e.key === 'Escape') { setAddingCaseIn(null); setNewCaseName(''); }
                                                }}
                                                className="h-6 text-xs font-mono border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                            />
                                            <Button size="sm" onClick={() => handleAddCase(suite.id)} disabled={!newCaseName.trim() || isPending} className="h-6 text-xs shrink-0">
                                                {t('add')}
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => { setAddingCaseIn(null); setNewCaseName(''); }} className="h-6 text-xs shrink-0">
                                                {t('cancel')}
                                            </Button>
                                        </div>
                                    )}

                                    {!readOnly && addingCaseIn !== suite.id && (
                                        <button
                                            onClick={() => { setAddingCaseIn(suite.id); setNewCaseName(''); }}
                                            disabled={isPending}
                                            className="flex items-center gap-1.5 px-3 py-1.5 w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors border-t border-dashed"
                                        >
                                            <PlusIcon className="size-3" />
                                            {t('test-add-case')}
                                        </button>
                                    )}
                                </div>
                                </motion.div>
                            )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Linked task */}
            {task.linkedTaskId ? (
                <div className="inline-flex flex-col gap-1">
                    <button
                        onClick={() => window.open(`/workspaces/${task.workspaceId}/tasks/${task.linkedTaskId}`, '_blank')}
                        className="inline-flex items-center gap-1.5 rounded-md border bg-muted/30 px-2 py-1 text-xs hover:bg-muted transition-colors group max-w-fit"
                        title={t('open-in-new-page')}
                    >
                        {(() => {
                            const typeOpt = TASK_TYPE_OPTIONS.find(o => o.value === (linkedTaskData?.type ?? 'task'));
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
                <div className="relative">
                    {isLinking ? (
                        <div className="flex items-center gap-2 rounded-md border bg-muted/20 px-2.5 py-1.5">
                            <SearchIcon className="size-3.5 text-muted-foreground shrink-0" />
                            <Input
                                autoFocus
                                placeholder={t('test-search-placeholder')}
                                value={linkSearch}
                                onChange={e => setLinkSearch(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Escape') { setIsLinking(false); setLinkSearch(''); } }}
                                className="h-5 text-xs border-0 rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                            />
                            <button
                                onClick={() => { setIsLinking(false); setLinkSearch(''); }}
                                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            >
                                <XIcon className="size-3.5" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsLinking(true)}
                            disabled={isPending}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <PlusIcon className="size-3" />
                            {t('test-link-task')}
                        </button>
                    )}
                    {isLinking && searchTasks.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-md overflow-hidden">
                            {searchTasks.map(result => {
                                const typeOpt = TASK_TYPE_OPTIONS.find(o => o.value === result.type);
                                const TypeIcon = typeOpt?.icon;
                                return (
                                    <button
                                        key={result.$id}
                                        onClick={() => handleLinkTask(result.$id)}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                                    >
                                        {TypeIcon && <TypeIcon className={cn('size-3.5 shrink-0', typeOpt?.textColor)} />}
                                        <span className="truncate">{result.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
};