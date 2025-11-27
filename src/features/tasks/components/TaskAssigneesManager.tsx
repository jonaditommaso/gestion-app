'use client'
import { useState } from "react";
import { WorkspaceMember } from "../types";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { useTranslations } from "next-intl";
import { Check, UserPlus, X } from "lucide-react";
import { useAssignTask } from "../api/use-assign-task";
import { useUnassignTask } from "../api/use-unassign-task";
import { useCurrent } from "@/features/auth/api/use-current";

interface TaskAssigneesManagerProps {
    taskId: string;
    assignees: WorkspaceMember[];
    availableMembers: WorkspaceMember[];
}

export const TaskAssigneesManager = ({ taskId, assignees, availableMembers }: TaskAssigneesManagerProps) => {
    const t = useTranslations('workspaces');
    const [open, setOpen] = useState(false);
    const { data: currentUser } = useCurrent();
    const { mutate: assignTask, isPending: isAssigning } = useAssignTask();
    const { mutate: unassignTask, isPending: isUnassigning } = useUnassignTask();

    const isPending = isAssigning || isUnassigning;

    const currentMember = availableMembers.find(m => m.userId === currentUser?.$id);
    const isCurrentUserAssigned = assignees.some(a => a.userId === currentUser?.$id);

    const handleAssign = (memberId: string) => {
        assignTask({
            param: { taskId },
            json: { workspaceMemberId: memberId }
        }, {
            onSuccess: () => {
                // No cerrar el popover para permitir múltiples asignaciones
            }
        });
    };

    const handleUnassign = (memberId: string) => {
        unassignTask({
            param: { taskId, workspaceMemberId: memberId }
        });
    };

    const handleAssignToMe = () => {
        if (currentMember && !isCurrentUserAssigned) {
            handleAssign(currentMember.$id);
        }
    };

    return (
        <div className="flex items-center gap-x-2">
            {assignees && assignees.length > 0 ? (
                <>
                    <div className="flex items-center -space-x-2">
                        {assignees.slice(0, 3).map((assignee, index) => (
                            <div
                                key={assignee.$id}
                                style={{ zIndex: assignees.length - index }}
                                className="relative group"
                            >
                                <MemberAvatar
                                    name={assignee.name}
                                    className="size-6 border-2 border-background cursor-pointer transition-transform hover:scale-110"
                                />
                                <button
                                    onClick={() => handleUnassign(assignee.$id)}
                                    disabled={isPending}
                                    className="absolute -top-1 -right-1 size-4 bg-destructive text-destructive-foreground rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex z-10"
                                >
                                    <X className="size-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto px-2 py-1 text-sm hover:bg-muted"
                                disabled={isPending}
                            >
                                {assignees[0].name}
                                {assignees.length > 1 && (
                                    <span className="text-muted-foreground ml-1">
                                        +{assignees.length - 1}
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[240px] p-0" align="start">
                            <Command>
                                <CommandInput placeholder={t('search')} />
                                <CommandList>
                                    <CommandEmpty>{t('no-results-found')}</CommandEmpty>

                                    {currentMember && !isCurrentUserAssigned && (
                                        <>
                                            <CommandGroup>
                                                <CommandItem
                                                    onSelect={handleAssignToMe}
                                                    disabled={isPending}
                                                    className="cursor-pointer"
                                                >
                                                    <UserPlus className="mr-2 size-4" />
                                                    {t('assign-to-me')}
                                                </CommandItem>
                                            </CommandGroup>
                                            <CommandSeparator />
                                        </>
                                    )}

                                    <CommandGroup heading={t('assignees')}>
                                        {availableMembers.map((member) => {
                                            const isAssigned = assignees.some(a => a.$id === member.$id);
                                            return (
                                                <CommandItem
                                                    key={member.$id}
                                                    onSelect={() => {
                                                        if (isAssigned) {
                                                            handleUnassign(member.$id);
                                                        } else {
                                                            handleAssign(member.$id);
                                                        }
                                                    }}
                                                    disabled={isPending}
                                                    className="cursor-pointer"
                                                >
                                                    <div className="flex items-center flex-1 gap-x-2">
                                                        <MemberAvatar
                                                            name={member.name}
                                                            className="size-5"
                                                        />
                                                        <span className="truncate">{member.name}</span>
                                                    </div>
                                                    {isAssigned && (
                                                        <Check className="size-4 text-primary" />
                                                    )}
                                                </CommandItem>
                                            );
                                        })}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </>
            ) : (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                            disabled={isPending}
                        >
                            {t('no-assignee')}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[240px] p-0" align="start">
                        <Command>
                            <CommandInput placeholder={t('search')} />
                            <CommandList>
                                <CommandEmpty>{t('no-results-found')}</CommandEmpty>

                                {currentMember && (
                                    <>
                                        <CommandGroup>
                                            <CommandItem
                                                onSelect={handleAssignToMe}
                                                disabled={isPending}
                                                className="cursor-pointer"
                                            >
                                                <UserPlus className="mr-2 size-4" />
                                                {t('assign-to-me')}
                                            </CommandItem>
                                        </CommandGroup>
                                        <CommandSeparator />
                                    </>
                                )}

                                <CommandGroup heading={t('add-assignee')}>
                                    {availableMembers.map((member) => (
                                        <CommandItem
                                            key={member.$id}
                                            onSelect={() => handleAssign(member.$id)}
                                            disabled={isPending}
                                            className="cursor-pointer"
                                        >
                                            <MemberAvatar
                                                name={member.name}
                                                className="mr-2 size-5"
                                            />
                                            <span className="truncate">{member.name}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
};
