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
import { SELL_SQUAD_ICONS } from "./CreateSellSquadFlow";
import { useAddSellSquadMember } from "../../api/use-add-sell-squad-member";
import { useRemoveSellSquadMember } from "../../api/use-remove-sell-squad-member";
import { useDeleteSellSquad } from "../../api/use-delete-sell-squad";
import { SellSquad, Seller } from "../../types";

interface SellSquadCardProps {
    squad: SellSquad;
    availableSellers: Seller[];
    onEdit: (squad: SellSquad) => void;
}

const SellSquadCard = ({ squad, availableSellers, onEdit }: SellSquadCardProps) => {
    const t = useTranslations("sales");
    const [addSellerOpen, setAddSellerOpen] = useState(false);

    const { mutate: addMember, isPending: isAdding } = useAddSellSquadMember();
    const { mutate: removeMember, isPending: isRemoving } = useRemoveSellSquadMember();
    const { mutate: deleteSquad, isPending: isDeleting } = useDeleteSellSquad();

    const members: Seller[] = squad.members ?? [];
    const lead = squad.leadSeller;
    const isPending = isAdding || isRemoving;

    const parsedMeta = (() => {
        try { return squad.metadata ? (JSON.parse(squad.metadata) as { color?: string | null; icon?: string | null }) : null; }
        catch { return null; }
    })();
    const squadIconDef = parsedMeta?.icon ? SELL_SQUAD_ICONS.find(i => i.id === parsedMeta.icon) : null;
    const squadColor = parsedMeta?.color ?? null;

    const nonMembers = availableSellers.filter(s => !members.some(m => m.id === s.id));

    const handleAddMember = (sellerId: string) => {
        addMember(
            { param: { squadId: squad.$id }, json: { sellerId } },
            { onSuccess: () => setAddSellerOpen(false) }
        );
    };

    const handleRemoveMember = (sellerId: string) => {
        removeMember({ param: { squadId: squad.$id, sellerId } });
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
                                {t("squads.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => deleteSquad({ param: { squadId: squad.$id } })}
                                disabled={isDeleting}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="size-4 mr-2" />
                                {t("squads.delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
                <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                        {members.length} {members.length === 1 ? t("squads.seller") : t("squads.sellers")}
                    </Badge>
                </div>

                <div className="space-y-1">
                    {members.map(seller => (
                        <div key={seller.id} className="flex items-center justify-between group py-1">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <MemberAvatar name={seller.name} memberId={seller.memberId} className="size-6" />
                                    {lead?.id === seller.id && (
                                        <Award className="size-2.5 text-blue-500 absolute -top-1 -right-1" />
                                    )}
                                </div>
                                <span className="text-sm">{seller.name}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveMember(seller.id)}
                                disabled={isPending}
                            >
                                <X className="size-3" />
                            </Button>
                        </div>
                    ))}
                </div>

                <Popover open={addSellerOpen} onOpenChange={setAddSellerOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-7 text-xs"
                            disabled={isPending || nonMembers.length === 0}
                        >
                            <UserPlus className="size-3 mr-1.5" />
                            {t("squads.add-seller")}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-0" align="start">
                        <Command>
                            <CommandInput placeholder={t("squads.search")} />
                            <CommandList>
                                <CommandEmpty>{t("squads.no-results-found")}</CommandEmpty>
                                <CommandGroup>
                                    {nonMembers.map(seller => (
                                        <CommandItem
                                            key={seller.id}
                                            onSelect={() => handleAddMember(seller.id)}
                                            disabled={isPending}
                                            className="cursor-pointer"
                                        >
                                            <MemberAvatar name={seller.name} memberId={seller.memberId} className="size-5 mr-2" />
                                            {seller.name}
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

export default SellSquadCard;
