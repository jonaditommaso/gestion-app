"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import {
    ChevronDown,
    ChevronRight,
    GitBranch,
    GitMerge,
    GitPullRequest,
    GitCommitHorizontal,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    SkipForward,
    Loader2,
    ExternalLink,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useGetGithubDevData } from "../api/use-get-github-dev-data";
import type { GitHubCheckRun, GitHubPR } from "../types";
import { es, enUS, it } from "date-fns/locale";
import { useLocale } from "next-intl";

const DATE_LOCALES = { es, en: enUS, it };

interface GitHubDevelopmentPanelProps {
    workspaceId: string;
    owner: string;
    repo: string;
    branch: string;
}

function PRStateBadge({ pr }: { pr: GitHubPR }) {
    if (pr.merged) {
        return (
            <Badge className="gap-1 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                <GitMerge className="size-3" />
                Merged
            </Badge>
        );
    }
    if (pr.state === 'open') {
        return (
            <Badge className={cn("gap-1", pr.draft
                ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200"
                : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-800"
            )}>
                <GitPullRequest className="size-3" />
                {pr.draft ? 'Draft' : 'Open'}
            </Badge>
        );
    }
    return (
        <Badge className="gap-1 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800">
            <XCircle className="size-3" />
            Closed
        </Badge>
    );
}

function CheckIcon({ run }: { run: GitHubCheckRun }) {
    if (run.status !== 'completed') {
        return <Loader2 className="size-4 text-yellow-500 animate-spin" />;
    }
    switch (run.conclusion) {
        case 'success': return <CheckCircle2 className="size-4 text-green-500" />;
        case 'failure': return <XCircle className="size-4 text-red-500" />;
        case 'cancelled': return <XCircle className="size-4 text-gray-400" />;
        case 'skipped': return <SkipForward className="size-4 text-gray-400" />;
        case 'timed_out': return <Clock className="size-4 text-orange-500" />;
        case 'action_required': return <AlertCircle className="size-4 text-orange-500" />;
        default: return <AlertCircle className="size-4 text-gray-400" />;
    }
}

export function GitHubDevelopmentPanel({ workspaceId, owner, repo, branch }: GitHubDevelopmentPanelProps) {
    const t = useTranslations('workspaces');
    const locale = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const { data, isLoading, error } = useGetGithubDevData(workspaceId, owner, repo, branch);

    const dateLocale = DATE_LOCALES[locale as keyof typeof DATE_LOCALES] ?? enUS;

    const openPRs = data?.pullRequests.filter(pr => pr.state === 'open' && !pr.merged) ?? [];
    const failedChecks = data?.checks.filter(c => c.conclusion === 'failure') ?? [];
    const successChecks = data?.checks.filter(c => c.conclusion === 'success') ?? [];
    const runningChecks = data?.checks.filter(c => c.status !== 'completed') ?? [];

    // Summary badges for the collapsed trigger
    const hasPRs = openPRs.length > 0;
    const hasFailures = failedChecks.length > 0;
    const allGreen = data && data.checks.length > 0 && failedChecks.length === 0 && runningChecks.length === 0;

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium hover:bg-muted/50 transition-colors">
                    {isOpen ? (
                        <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                    ) : (
                        <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                    )}
                    <GitBranch className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{t('github-dev-panel-title')}</span>
                    <span className="font-mono text-xs text-foreground/70 bg-muted rounded px-1.5 py-0.5 ml-1 truncate">
                        {branch}
                    </span>
                    <div className="flex items-center gap-1.5 ml-auto shrink-0">
                        {isLoading && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
                        {!isLoading && hasPRs && (
                            <Badge variant="secondary" className="gap-1 text-xs py-0 h-5">
                                <GitPullRequest className="size-3" />
                                {openPRs.length}
                            </Badge>
                        )}
                        {!isLoading && hasFailures && (
                            <XCircle className="size-4 text-red-500" />
                        )}
                        {!isLoading && allGreen && (
                            <CheckCircle2 className="size-4 text-green-500" />
                        )}
                    </div>
                </button>
            </CollapsibleTrigger>

            <CollapsibleContent>
                {error && (
                    <p className="text-xs text-muted-foreground px-2 py-3">{t('github-dev-error')}</p>
                )}
                {isLoading && (
                    <div className="flex items-center gap-2 px-2 py-4 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        {t('github-loading')}
                    </div>
                )}
                {data && (
                    <div className="space-y-4 px-2 pt-1 pb-3">

                        {/* Compare stats */}
                        {data.compare && (
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground/60">{t('github-dev-vs')} {data.compare.base}</span>
                                {data.compare.aheadBy > 0 && (
                                    <span className="flex items-center gap-0.5 text-green-600 dark:text-green-400">
                                        <ArrowUp className="size-3" />{data.compare.aheadBy}
                                    </span>
                                )}
                                {data.compare.behindBy > 0 && (
                                    <span className="flex items-center gap-0.5 text-orange-500">
                                        <ArrowDown className="size-3" />{data.compare.behindBy}
                                    </span>
                                )}
                                {data.compare.aheadBy === 0 && data.compare.behindBy === 0 && (
                                    <span>{t('github-dev-identical')}</span>
                                )}
                            </div>
                        )}

                        {/* Pull Requests */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                {t('github-dev-prs')} {data.pullRequests.length > 0 && `(${data.pullRequests.length})`}
                            </p>
                            {data.pullRequests.length === 0 ? (
                                <p className="text-xs text-muted-foreground">{t('github-dev-no-prs')}</p>
                            ) : (
                                <div className="space-y-2">
                                    {data.pullRequests.map(pr => (
                                        <div key={pr.number} className="flex items-start gap-2 rounded-md border bg-muted/30 p-2">
                                            <Avatar className="size-5 shrink-0 mt-0.5">
                                                <AvatarImage src={pr.authorAvatar} />
                                                <AvatarFallback className="text-[10px]">{pr.author[0]?.toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <a
                                                        href={pr.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs font-medium hover:underline truncate"
                                                    >
                                                        #{pr.number} {pr.title}
                                                    </a>
                                                    <ExternalLink className="size-3 text-muted-foreground shrink-0" />
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <PRStateBadge pr={pr} />
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {pr.author} · {formatDistanceToNow(new Date(pr.updatedAt), { addSuffix: true, locale: dateLocale })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent commits */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                {t('github-dev-commits')}
                            </p>
                            {data.commits.length === 0 ? (
                                <p className="text-xs text-muted-foreground">{t('github-dev-no-commits')}</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {data.commits.map(c => (
                                        <div key={c.sha} className="flex items-start gap-2">
                                            <GitCommitHorizontal className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <a
                                                        href={c.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs hover:underline truncate"
                                                    >
                                                        {c.message}
                                                    </a>
                                                    <ExternalLink className="size-3 text-muted-foreground shrink-0" />
                                                </div>
                                                <p className="text-[10px] text-muted-foreground">
                                                    <span className="font-mono">{c.sha}</span>
                                                    {' · '}{c.author}
                                                    {' · '}{formatDistanceToNow(new Date(c.date), { addSuffix: true, locale: dateLocale })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* CI Checks */}
                        {data.checks.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                    {t('github-dev-checks')} {`(${successChecks.length}/${data.checks.length})`}
                                </p>
                                <div className="space-y-1.5">
                                    {data.checks.map(run => (
                                        <div key={run.id} className="flex items-center gap-2">
                                            <CheckIcon run={run} />
                                            <a
                                                href={run.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs hover:underline truncate"
                                            >
                                                {run.name}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CollapsibleContent>
        </Collapsible>
    );
}
