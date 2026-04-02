'use client'
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Award, MoreHorizontal, Pencil, Trash2, UserPlus, X } from "lucide-react";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import { SQUAD_ICONS } from "./CreateSquadFlow";
import { useAddSquadMember } from "../../api/squads/use-add-squad-member";
import { useRemoveSquadMember } from "../../api/squads/use-remove-squad-member";
import { useDeleteSquad } from "../../api/squads/use-delete-squad";
import { TaskSquad, WorkspaceMember } from "../../types";

interface SquadCardProps {
    squad: TaskSquad;
    workspaceId: string;
    availableMembers: WorkspaceMember[];
    onEdit: (squad: TaskSquad) => void;
}

const SquadCard = ({ squad, workspaceId, availableMembers, onEdit }: SquadCardProps) => {
    const t = useTranslations('workspaces');
    const [addMemberOpen, setAddMemberOpen] = useState(false);

    const { mutate: addMember, isPending: isAdding } = useAddSquadMember(workspaceId);
    const { mutate: removeMember, isPending: isRemoving } = useRemoveSquadMember(workspaceId);
    const { mutate: deleteSquad, isPending: isDeleting } = useDeleteSquad(workspaceId);

    const members: WorkspaceMember[] = squad.members ?? [];
    const lead = squad.leadMember;
    const isPending = isAdding || isRemoving;

    const parsedMeta = (() => {
        try { return squad.metadata ? (JSON.parse(squad.metadata) as { color?: string | null; icon?: string | null }) : null; }
        catch { return null; }
    })();
    const squadIconDef = parsedMeta?.icon ? SQUAD_ICONS.find(i => i.id === parsedMeta.icon) : null;
    const squadColor = parsedMeta?.color ?? null;

    const nonMembers = availableMembers.filter(m => !members.some((sm: WorkspaceMember) => sm.$id === m.$id));

    const handleAddMember = (memberId: string) => {
        addMember(
            { param: { squadId: squad.$id }, json: { memberId } },
            { onSuccess: () => setAddMemberOpen(false) }
        );
    };

    const handleRemoveMember = (memberId: string) => {
        removeMember({ param: { squadId: squad.$id, memberId } });
    };

    return (
        <Card className="flex flex-col w-80">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                            className="shrink-0 size-9 rounded-lg flex items-center justify-center"
                            style={squadColor ? { backgroundColor: `${squadColor}22` } : undefined}
                        >
                            {squadIconDef ? (
                                <squadIconDef.icon
                                    className="size-4"
                                    style={squadColor ? { color: squadColor } : undefined}
                                />
                            ) : (
                                <span
                                    className="text-sm font-semibold leading-none"
                                    style={squadColor ? { color: squadColor } : undefined}
                                >
                                    {squad.name.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-base truncate">{squad.name}</h3>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-7 flex-shrink-0">
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(squad)}>
                                <Pencil className="size-4 mr-2" />
                                {t('edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => deleteSquad({ param: { squadId: squad.$id } })}
                                disabled={isDeleting}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="size-4 mr-2" />
                                {t('delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
                <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                        {members.length} {members.length === 1 ? t('member') : t('members')}
                    </Badge>
                </div>

                {/* Members list */}
                <div className="space-y-1">
                    {members.map(member => (
                        <div key={member.$id} className="flex items-center justify-between group py-1">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <MemberAvatar name={member.name} memberId={member.$id} className="size-6" />
                                    {lead?.$id === member.$id && (
                                        <Award className="size-2.5 text-blue-500 absolute -top-1 -right-1" />
                                    )}
                                </div>
                                <span className="text-sm">{member.name}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveMember(member.$id)}
                                disabled={isPending}
                            >
                                <X className="size-3" />
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Add member */}
                <Popover open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-7 text-xs"
                            disabled={isPending || nonMembers.length === 0}
                        >
                            <UserPlus className="size-3 mr-1.5" />
                            {t('add-member')}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-0" align="start">
                        <Command>
                            <CommandInput placeholder={t('search')} />
                            <CommandList>
                                <CommandEmpty>{t('no-results-found')}</CommandEmpty>
                                <CommandGroup>
                                    {nonMembers.map(m => (
                                        <CommandItem
                                            key={m.$id}
                                            onSelect={() => handleAddMember(m.$id)}
                                            disabled={isPending}
                                            className="cursor-pointer"
                                        >
                                            <MemberAvatar name={m.name} memberId={m.$id} className="size-5 mr-2" />
                                            {m.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </CardContent>
        </Card>
    );
};

export default SquadCard;
