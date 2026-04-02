'use client'
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, Users, X } from "lucide-react";
import { useAssignSquadToTask } from "../api/squads/use-assign-squad-to-task";
import { useUnassignSquadFromTask } from "../api/squads/use-unassign-squad-from-task";
import { TaskSquad } from "../types";
import { SQUAD_ICONS } from "./squads/CreateSquadFlow";
import { cn } from "@/lib/utils";

interface TaskSquadsManagerProps {
    taskId: string;
    squads: TaskSquad[];
    availableSquads: TaskSquad[];
    readOnly?: boolean;
}

export const TaskSquadsManager = ({ taskId, squads, availableSquads, readOnly = false }: TaskSquadsManagerProps) => {
    const t = useTranslations('workspaces');
    const [open, setOpen] = useState(false);
    const { mutate: assignSquad, isPending: isAssigning } = useAssignSquadToTask();
    const { mutate: unassignSquad, isPending: isUnassigning } = useUnassignSquadFromTask();
    const isPending = isAssigning || isUnassigning;

    const handleAssign = (squadId: string) => {
        assignSquad({ param: { squadId, taskId } });
    };

    const handleUnassign = (squadId: string) => {
        unassignSquad({ param: { squadId, taskId } });
    };

    if (readOnly) {
        return (
            <div className="flex items-center gap-x-2 flex-wrap gap-y-1">
                {squads && squads.length > 0 ? (
                    squads.map(squad => {
                        const rawMeta = (() => { try { return squad.metadata ? (JSON.parse(squad.metadata) as { color?: string | null; icon?: string | null }) : null; } catch { return null; } })();
                        const color = rawMeta?.color ?? null;
                        const rawIcon = rawMeta?.icon ?? null;
                        const iconDef = rawIcon ? SQUAD_ICONS.find(i => i.id === rawIcon) : null;
                        const IconComp = iconDef?.icon;
                        return (
                            <span
                                key={squad.$id}
                                className={cn("inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md", !color && "bg-secondary text-secondary-foreground")}
                                style={color ? { backgroundColor: `${color}22`, color, border: `1px solid ${color}44` } : undefined}
                            >
                                {IconComp && <IconComp className="size-3 shrink-0" />}
                                {squad.name}
                            </span>
                        );
                    })
                ) : (
                    <span className="text-sm text-muted-foreground px-2 py-1">{t('no-squad')}</span>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-x-2 flex-wrap gap-y-1">
            {squads && squads.length > 0 && squads.map(squad => {
                const rawMeta = (() => { try { return squad.metadata ? (JSON.parse(squad.metadata) as { color?: string | null; icon?: string | null }) : null; } catch { return null; } })();
                const color = rawMeta?.color ?? null;
                const rawIcon = rawMeta?.icon ?? null;
                const iconDef = rawIcon ? SQUAD_ICONS.find(i => i.id === rawIcon) : null;
                const IconComp = iconDef?.icon;
                return (
                    <div key={squad.$id} className="group relative">
                        <span
                            className={cn("inline-flex items-center gap-1 pl-2 pr-1 py-0.5 text-xs font-medium rounded-md", !color && "bg-secondary text-secondary-foreground")}
                            style={color ? { backgroundColor: `${color}22`, color, border: `1px solid ${color}44` } : undefined}
                        >
                            {IconComp && <IconComp className="size-3 shrink-0" />}
                            {squad.name}
                            <button
                                onClick={() => handleUnassign(squad.$id)}
                                disabled={isPending}
                                className="ml-0.5 rounded-full hover:bg-destructive hover:text-destructive-foreground p-0.5 transition-colors"
                            >
                                <X className="size-2.5" />
                            </button>
                        </span>
                    </div>
                );
            })}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        disabled={isPending}
                    >
                        <Users className="size-3.5 mr-1" />
                        {squads.length === 0 ? t('assign-squad') : t('add-squad')}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder={t('search')} />
                        <CommandList>
                            <CommandEmpty>{t('no-results-found')}</CommandEmpty>
                            <CommandGroup heading={t('squads')}>
                                {availableSquads.map(squad => {
                                    const isAssigned = squads.some(s => s.$id === squad.$id);
                                    return (
                                        <CommandItem
                                            key={squad.$id}
                                            onSelect={() => {
                                                if (isAssigned) {
                                                    handleUnassign(squad.$id);
                                                } else {
                                                    handleAssign(squad.$id);
                                                }
                                            }}
                                            disabled={isPending}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center flex-1 gap-x-2">
                                                {
                                                    (() => {
                                                        const rawMeta = (() => { try { return squad.metadata ? (JSON.parse(squad.metadata) as { color?: string | null; icon?: string | null }) : null; } catch { return null; } })();
                                                        const color = rawMeta?.color ?? null;
                                                        const rawIcon = rawMeta?.icon ?? null;
                                                        const iconDef = rawIcon ? SQUAD_ICONS.find(i => i.id === rawIcon) : null;
                                                        const IconComp = iconDef?.icon;
                                                        return IconComp ? <IconComp className="size-4 shrink-0" style={color ? { color } : undefined} /> : null;
                                                    })()
                                                }
                                                <div className="flex flex-col min-w-0">
                                                    <span className="truncate text-sm">{squad.name}</span>
                                                    {(squad.members?.length ?? 0) > 0 && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {squad.members!.length} {squad.members!.length === 1 ? t('member') : t('members')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {isAssigned && <Check className="size-4 text-primary flex-shrink-0" />}
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
};
