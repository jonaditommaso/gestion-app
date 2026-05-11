"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Github, Link, Plus, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { useGetGithubStatus } from "../api/use-get-github-status";
import { useDisconnectGithub } from "../api/use-disconnect-github";
import { useAddGithubRepo } from "../api/use-add-github-repo";
import { useRemoveGithubRepo } from "../api/use-remove-github-repo";
import { useGetGithubAvailableRepos } from "../api/use-get-github-available-repos";
import type { GitHubRepo } from "../types";
import { useConfirm } from "@/hooks/use-confirm";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GitHubIntegrationSectionProps {
    workspaceId: string;
    canWrite: boolean;
}

export const GitHubIntegrationSection = ({ workspaceId, canWrite }: GitHubIntegrationSectionProps) => {
    const t = useTranslations('workspaces');
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [ConfirmDisconnect, confirmDisconnect] = useConfirm(
        t('github-disconnect-title'),
        t('github-disconnect-confirm')
    );

    const { data: status, isLoading: isStatusLoading } = useGetGithubStatus(workspaceId);
    const { mutate: disconnect, isPending: isDisconnecting } = useDisconnectGithub(workspaceId);
    const { mutate: addRepo, isPending: isAdding } = useAddGithubRepo(workspaceId);
    const { mutate: removeRepo, isPending: isRemoving } = useRemoveGithubRepo(workspaceId);
    const { data: availableRepos, isLoading: isLoadingRepos } = useGetGithubAvailableRepos(workspaceId, isPickerOpen);

    const { isFree, limits } = usePlanAccess();
    const repoLimit = limits.githubRepos;
    const connectedCount = status?.repos?.length ?? 0;
    const atLimit = repoLimit !== -1 && connectedCount >= repoLimit;

    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            const res = await fetch(`/api/github/auth-url/${workspaceId}`);
            if (!res.ok) {
                const body = await res.json() as { error?: string };
                if (body.error === 'GitHub integration not configured') {
                    toast.error(t('github-not-configured'));
                } else {
                    toast.error(t('github-failed-connect'));
                }
                return;
            }
            const data = await res.json() as { data: { url: string } };
            window.location.href = data.data.url;
        } catch {
            toast.error(t('github-failed-connect'));
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        const ok = await confirmDisconnect();
        if (ok) disconnect();
    };

    const handleAddRepo = (repo: GitHubRepo) => {
        addRepo(repo);
        setIsPickerOpen(false);
    };

    if (isStatusLoading) {
        return (
            <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
                <Loader2 className="size-4 animate-spin" />
                <span>{t('github-loading')}</span>
            </div>
        );
    }

    const isConnected = !!status?.connection;

    return (
        <div className="space-y-4">
            <ConfirmDisconnect />

            {/* Connection status */}
            {isConnected ? (
                <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/40">
                    <div className="flex items-center gap-3">
                        <div className="relative size-8 shrink-0">
                            <Avatar className="size-8">
                                <AvatarImage src={status.connection!.avatarUrl} />
                                <AvatarFallback className="bg-neutral-900 dark:bg-neutral-800">
                                    <Github className="size-4 text-white" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-800 ring-2 ring-background">
                                <Github className="size-2.5 text-white" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium">{status.connection!.login}</p>
                            <p className="text-xs text-muted-foreground">{t('github-connected-label')}</p>
                        </div>
                    </div>
                    {canWrite && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDisconnect}
                            disabled={isDisconnecting}
                            className="text-destructive hover:text-destructive"
                        >
                            {isDisconnecting ? <Loader2 className="size-4 animate-spin" /> : <Link className="size-4 mr-1" />}
                            {t('github-disconnect')}
                        </Button>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-between rounded-lg border border-dashed p-3">
                    <div className="flex items-center gap-3">
                        <Github className="size-5 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{t('github-not-connected')}</p>
                    </div>
                    {canWrite && !isFree && (
                        <Button size="sm" variant="outline" onClick={handleConnect} disabled={isConnecting}>
                            {isConnecting && <Loader2 className="size-4 mr-1.5 animate-spin" />}
                            {t('github-connect')}
                        </Button>
                    )}
                    {isFree && (
                        <Badge variant="secondary">{t('github-plan-required')}</Badge>
                    )}
                </div>
            )}

            {/* Connected repos */}
            {isConnected && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{t('github-repos-title')}</p>
                        {canWrite && (
                            <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={atLimit}
                                        title={atLimit ? t('github-repo-limit-reached') : undefined}
                                    >
                                        <Plus className="size-4 mr-1" />
                                        {t('github-add-repo')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>{t('github-add-repo-title')}</DialogTitle>
                                        <DialogDescription>{t('github-add-repo-description')}</DialogDescription>
                                    </DialogHeader>
                                    {isLoadingRepos ? (
                                        <div className="flex justify-center py-6">
                                            <RefreshCw className="size-5 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <Command>
                                            <CommandInput placeholder={t('github-search-repos')} />
                                            <CommandList>
                                                <CommandEmpty>{t('github-no-repos-found')}</CommandEmpty>
                                                {(availableRepos ?? [])
                                                    .filter(r => !(status.repos ?? []).find(cr => cr.id === r.id))
                                                    .map(repo => (
                                                        <CommandItem
                                                            key={repo.id}
                                                            value={repo.fullName}
                                                            onSelect={() => handleAddRepo(repo)}
                                                            className="cursor-pointer"
                                                        >
                                                            <GitBranch className="size-4 mr-2 shrink-0 text-muted-foreground" />
                                                            <span className="truncate">{repo.fullName}</span>
                                                            {repo.private && (
                                                                <Badge variant="outline" className="ml-auto text-xs shrink-0">
                                                                    {t('github-private')}
                                                                </Badge>
                                                            )}
                                                        </CommandItem>
                                                    ))}
                                            </CommandList>
                                        </Command>
                                    )}
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    {/* Plan limit indicator */}
                    {repoLimit !== -1 && (
                        <p className="text-xs text-muted-foreground">
                            {t('github-repos-used', { count: connectedCount, limit: repoLimit })}
                        </p>
                    )}

                    {/* List of connected repos */}
                    {(status.repos ?? []).length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">{t('github-no-repos-connected')}</p>
                    ) : (
                        <ul className="space-y-2">
                            {(status.repos ?? []).map(repo => (
                                <li key={repo.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <GitBranch className="size-4 text-muted-foreground shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{repo.fullName}</p>
                                            {repo.description && (
                                                <p className="text-xs text-muted-foreground truncate">{repo.description}</p>
                                            )}
                                        </div>
                                        {repo.private && (
                                            <Badge variant="outline" className="text-xs shrink-0">{t('github-private')}</Badge>
                                        )}
                                    </div>
                                    {canWrite && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                                            onClick={() => removeRepo(String(repo.id))}
                                            disabled={isRemoving || isAdding}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};
