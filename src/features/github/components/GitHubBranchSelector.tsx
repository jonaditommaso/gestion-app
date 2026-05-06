"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GitBranch, X } from "lucide-react";
import { useGetGithubBranches } from "../api/use-get-github-branches";
import type { GitHubRepo } from "../types";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface GitHubBranchSelectorProps {
    workspaceId: string;
    repos: GitHubRepo[];
    value: { branch?: string; repo?: string };
    onChange: (branch: string | undefined, repo: string | undefined) => void;
    disabled?: boolean;
}

export const GitHubBranchSelector = ({
    workspaceId,
    repos,
    value,
    onChange,
    disabled = false,
}: GitHubBranchSelectorProps) => {
    const t = useTranslations('workspaces');
    const [open, setOpen] = useState(false);

    const selectedRepo = repos.find(r => r.fullName === value.repo) ?? repos[0];

    const { data: branches, isLoading: isLoadingBranches } = useGetGithubBranches(
        workspaceId,
        selectedRepo?.owner ?? '',
        selectedRepo?.name ?? ''
    );

    if (!repos.length) {
        return (
            <p className="text-sm text-muted-foreground">{t('github-no-repos-connected')}</p>
        );
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(undefined, undefined);
    };

    return (
        <div className="space-y-2">
            {/* Repo selector — only show if multiple repos */}
            {repos.length > 1 && (
                <Select
                    value={selectedRepo?.fullName}
                    onValueChange={(fullName) => {
                        // reset branch when switching repos
                        onChange(undefined, fullName);
                    }}
                    disabled={disabled}
                >
                    <SelectTrigger className="border-0 h-auto shadow-none bg-transparent hover:bg-muted rounded-sm px-1.5 py-1 text-sm [&>svg]:hidden">
                        <SelectValue placeholder={t('github-select-repo')} />
                    </SelectTrigger>
                    <SelectContent>
                        {repos.map(r => (
                            <SelectItem key={r.id} value={r.fullName}>
                                {r.fullName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* Branch selector */}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        role="combobox"
                        disabled={disabled || !selectedRepo}
                        className="h-auto w-fit border-0 shadow-none bg-transparent hover:bg-muted rounded-sm px-1.5 py-1 text-sm font-normal justify-start"
                    >
                        {value.branch ? (
                            <span className="flex items-center gap-1.5">
                                <GitBranch className="size-3.5 shrink-0 text-muted-foreground" />
                                <span className="truncate">{value.branch}</span>
                                <span
                                    role="button"
                                    onClick={handleClear}
                                    className="rounded hover:bg-muted p-0.5"
                                    aria-label={t('github-clear-branch')}
                                >
                                    <X className="size-3" />
                                </span>
                            </span>
                        ) : (
                            <span className="text-muted-foreground">{t('github-select-branch')}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0">
                    <Command>
                        <CommandInput placeholder={t('github-search-branches')} />
                        <CommandList>
                            {isLoadingBranches ? (
                                <div className="py-3 text-center text-sm text-muted-foreground">
                                    {t('github-loading-branches')}
                                </div>
                            ) : (
                                <>
                                    <CommandEmpty>{t('github-no-branches')}</CommandEmpty>
                                    {(branches ?? []).map(branch => (
                                        <CommandItem
                                            key={branch.name}
                                            value={branch.name}
                                            onSelect={() => {
                                                onChange(branch.name, selectedRepo.fullName);
                                                setOpen(false);
                                            }}
                                        >
                                            <GitBranch className="size-3.5 mr-2 text-muted-foreground" />
                                            <span className="truncate">{branch.name}</span>
                                        </CommandItem>
                                    ))}
                                </>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
};
