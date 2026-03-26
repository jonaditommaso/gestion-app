'use client'
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft, Award, Check,
    Code2, Crown, Cpu, Flame, Globe, LucideIcon,
    Rocket, Shield, Sparkles, Star, Target, Trophy, Users, Zap,
} from "lucide-react";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import { useCreateSellSquad } from "../../api/use-create-sell-squad";
import { useAddSellSquadMember } from "../../api/use-add-sell-squad-member";
import { Seller } from "../../types";
import { cn } from "@/lib/utils";

interface CreateSellSquadFlowProps {
    sellers: Seller[];
    onDone: () => void;
    onCancel: () => void;
}

type SquadIconDef = { id: string; icon: LucideIcon };

export const SELL_SQUAD_ICONS: SquadIconDef[] = [
    { id: 'users', icon: Users },
    { id: 'zap', icon: Zap },
    { id: 'shield', icon: Shield },
    { id: 'star', icon: Star },
    { id: 'target', icon: Target },
    { id: 'flame', icon: Flame },
    { id: 'rocket', icon: Rocket },
    { id: 'trophy', icon: Trophy },
    { id: 'crown', icon: Crown },
    { id: 'code2', icon: Code2 },
    { id: 'globe', icon: Globe },
    { id: 'cpu', icon: Cpu },
    { id: 'sparkles', icon: Sparkles },
];

export const SELL_SQUAD_COLORS = [
    '#14b8a6', '#06b6d4', '#6366f1', '#8b5cf6',
    '#f43f5e', '#f59e0b', '#84cc16', '#64748b',
];

const CreateSellSquadFlow = ({ sellers, onDone, onCancel }: CreateSellSquadFlowProps) => {
    const t = useTranslations("sales");
    const [step, setStep] = useState<1 | 2>(1);

    const [name, setName] = useState('');
    const [selectedSellerIds, setSelectedSellerIds] = useState<string[]>([]);
    const [leadSellerId, setLeadSellerId] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedIcon, setSelectedIcon] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { mutateAsync: createSquadAsync } = useCreateSellSquad();
    const { mutateAsync: addMemberAsync } = useAddSellSquadMember();

    const toggleSeller = (sellerId: string) => {
        setSelectedSellerIds(prev => {
            const next = prev.includes(sellerId)
                ? prev.filter(id => id !== sellerId)
                : [...prev, sellerId];
            if (!next.includes(leadSellerId)) {
                setLeadSellerId(next[0] ?? '');
            }
            return next;
        });
    };

    const selectedSellers = sellers.filter(s => selectedSellerIds.includes(s.id));
    const effectiveLeader = selectedSellers.find(s => s.id === leadSellerId);

    const canContinue = name.trim().length > 0 && selectedSellerIds.length >= 2;

    const handleCreate = async () => {
        if (!name.trim() || isSubmitting) return;
        setIsSubmitting(true);

        const metadata = (selectedColor || selectedIcon)
            ? JSON.stringify({ color: selectedColor || null, icon: selectedIcon || null })
            : undefined;

        try {
            const created = await createSquadAsync({
                json: {
                    name: name.trim(),
                    leadSellerId: leadSellerId || null,
                    metadata,
                },
            });
            const squadId = created.data.$id;
            if (selectedSellerIds.length > 0) {
                await Promise.allSettled(
                    selectedSellerIds.map(sellerId =>
                        addMemberAsync({ param: { squadId }, json: { sellerId } })
                    )
                );
            }
            onDone();
        } catch {
            setIsSubmitting(false);
        }
    };

    if (step === 1) {
        return (
            <div className="space-y-5">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <ArrowLeft className="size-4" />
                        </button>
                        <h2 className="font-semibold text-lg">{t("squads.squad-step1-title")}</h2>
                    </div>
                    <p className="text-sm text-muted-foreground pl-8">{t("squads.squad-step1-desc")}</p>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="sell-squad-name-input">{t("squads.squad-name")}</Label>
                    <Input
                        id="sell-squad-name-input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder={t("squads.squad-name-placeholder")}
                        autoFocus
                    />
                </div>

                {sellers.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>{t("squads.squad-add-sellers")}</Label>
                            {selectedSellerIds.length > 0 && (
                                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                                    {selectedSellerIds.length}
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {sellers.map(seller => {
                                const isSelected = selectedSellerIds.includes(seller.id);
                                const isLeader = leadSellerId === seller.id;
                                return (
                                    <div key={seller.id} className="flex items-center">
                                        <button
                                            type="button"
                                            onClick={() => toggleSeller(seller.id)}
                                            className={cn(
                                                "flex items-center gap-2.5 flex-1 min-w-0 rounded-l-lg border-y border-l px-3 py-2.5 text-sm transition-all text-left",
                                                isLeader
                                                    ? "border-blue-500 dark:border-blue-500/40 bg-primary/8 text-foreground"
                                                    : isSelected
                                                        ? "border-primary bg-primary/8 text-foreground"
                                                        : "border-border bg-background hover:border-primary/50 hover:bg-muted/50 text-muted-foreground"
                                            )}
                                        >
                                            <MemberAvatar name={seller.name} memberId={seller.memberId} className="size-6 shrink-0" />
                                            <span className="truncate flex-1 font-medium">{seller.name}</span>
                                            {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!isSelected) {
                                                    setSelectedSellerIds(prev => [...prev, seller.id]);
                                                }
                                                setLeadSellerId(seller.id);
                                            }}
                                            title={t("squads.squad-set-as-leader")}
                                            className={cn(
                                                "shrink-0 w-8 self-stretch rounded-r-lg border flex items-center justify-center transition-colors",
                                                isLeader
                                                    ? "bg-blue-500/10 text-blue-500 border-blue-500 dark:border-blue-500/40"
                                                    : isSelected
                                                        ? "border-primary bg-primary/5 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/5 hover:border-blue-400/60"
                                                        : "border-border bg-background text-muted-foreground/50 hover:text-blue-500 hover:bg-blue-500/5 hover:border-blue-400/60"
                                            )}
                                        >
                                            <Award className="size-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {effectiveLeader && (
                    <div className="rounded-lg border bg-muted/30 px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <MemberAvatar name={effectiveLeader.name} memberId={effectiveLeader.memberId} className="size-6 shrink-0" />
                            <p className="text-sm text-muted-foreground">
                                {`${effectiveLeader.name} ${t("squads.squad-will-lead")}`}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        {t("squads.cancel")}
                    </Button>
                    <Button onClick={() => setStep(2)} disabled={!canContinue}>
                        {t("squads.squad-continue")}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                    <ArrowLeft className="size-4" />
                </button>
                <h2 className="font-semibold text-lg">{t("squads.squad-step2-title")}</h2>
            </div>

            <div className="space-y-2.5">
                <Label>{t("squads.squad-pick-color")}</Label>
                <div className="flex flex-wrap gap-2.5">
                    {SELL_SQUAD_COLORS.map(color => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color === selectedColor ? '' : color)}
                            className={cn(
                                "size-8 rounded-full border-2 transition-all",
                                selectedColor === color
                                    ? "border-foreground scale-110 shadow-sm"
                                    : "border-transparent hover:scale-105"
                            )}
                            style={{ backgroundColor: color }}
                            aria-label={color}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-2.5">
                <Label>{t("squads.squad-pick-icon")}</Label>
                <div className="grid grid-cols-7 gap-2">
                    {SELL_SQUAD_ICONS.map(({ id, icon: IconComp }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setSelectedIcon(id === selectedIcon ? '' : id)}
                            className={cn(
                                "rounded-lg p-2.5 border transition-all flex items-center justify-center",
                                selectedIcon === id
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border bg-background hover:border-primary/40 hover:bg-muted text-muted-foreground"
                            )}
                            style={
                                selectedIcon === id && selectedColor
                                    ? { borderColor: selectedColor, backgroundColor: `${selectedColor}20`, color: selectedColor }
                                    : {}
                            }
                        >
                            <IconComp className="size-4" />
                        </button>
                    ))}
                </div>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-1">{t("squads.squad-customize-optional")}</p>

            <div className="flex justify-end">
                <Button onClick={handleCreate} disabled={isSubmitting}>
                    {t("squads.create")}
                </Button>
            </div>
        </div>
    );
};

export default CreateSellSquadFlow;
