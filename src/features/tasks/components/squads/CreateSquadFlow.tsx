'use client'
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Award, Check, Code2, Crown, Cpu, Flame, Globe, LucideIcon, Rocket, Shield, Sparkles, Star, Target, Trophy, Users, Zap } from "lucide-react";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import { useCreateSquad } from "../../api/squads/use-create-squad";
import { useAddSquadMember } from "../../api/squads/use-add-squad-member";
import { WorkspaceMember } from "../../types";
import { cn } from "@/lib/utils";

interface CreateSquadFlowProps {
    workspaceId: string;
    availableMembers: WorkspaceMember[];
    currentMember: WorkspaceMember | undefined;
    onDone: () => void;
    onCancel: () => void;
}

type SquadIconDef = {
    id: string;
    icon: LucideIcon;
};

export const SQUAD_ICONS: SquadIconDef[] = [
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

export const SQUAD_COLORS = [
    '#14b8a6',
    '#06b6d4',
    '#6366f1',
    '#8b5cf6',
    '#f43f5e',
    '#f59e0b',
    '#84cc16',
    '#64748b',
];

const CreateSquadFlow = ({ workspaceId, availableMembers, currentMember, onDone, onCancel }: CreateSquadFlowProps) => {
    const t = useTranslations('workspaces');
    const [step, setStep] = useState<1 | 2>(1);

    const [name, setName] = useState('');
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [leadMemberId, setLeadMemberId] = useState<string>(currentMember?.$id ?? '');

    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedIcon, setSelectedIcon] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { mutateAsync: createSquadAsync } = useCreateSquad();
    const { mutateAsync: addMemberAsync } = useAddSquadMember(workspaceId);

    const toggleMember = (memberId: string) => {
        setSelectedMemberIds(prev => {
            const next = prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId];
            // If deselected member was the leader, reassign
            if (!next.includes(leadMemberId)) {
                if (next.includes(currentMember?.$id ?? '')) {
                    setLeadMemberId(currentMember?.$id ?? '');
                } else {
                    setLeadMemberId(next[0] ?? '');
                }
            }
            return next;
        });
    };

    const selectedMembers = availableMembers.filter(m => selectedMemberIds.includes(m.$id));
    const isCreatorLeader = !leadMemberId || leadMemberId === currentMember?.$id;
    const effectiveLeaderMember = isCreatorLeader
        ? currentMember
        : (selectedMembers.find(m => m.$id === leadMemberId) ?? currentMember);

    const canContinue = name.trim().length > 0 && selectedMemberIds.length >= 2;

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
                    workspaceId,
                    leadMemberId: leadMemberId || currentMember?.$id || null,
                    metadata,
                },
            });
            const squadId = created.data.$id;
            if (selectedMemberIds.length > 0) {
                await Promise.allSettled(
                    selectedMemberIds.map(memberId =>
                        addMemberAsync({ param: { squadId }, json: { memberId } })
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
                        <h2 className="font-semibold text-lg">{t('squad-step1-title')}</h2>
                    </div>
                    <p className="text-sm text-muted-foreground pl-8">{t('squad-step1-desc')}</p>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="squad-name-input">{t('squad-name')}</Label>
                    <Input
                        id="squad-name-input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder={t('squad-name-placeholder')}
                        autoFocus
                    />
                </div>

                {availableMembers.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>{t('squad-add-members')}</Label>
                            {selectedMemberIds.length > 0 && (
                                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                                    {selectedMemberIds.length}
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {availableMembers.map(member => {
                                const isSelected = selectedMemberIds.includes(member.$id);
                                const isMe = member.$id === currentMember?.$id;
                                const isLeader = leadMemberId === member.$id;
                                return (
                                    <div key={member.$id} className="flex items-center">
                                        <button
                                            type="button"
                                            onClick={() => toggleMember(member.$id)}
                                            className={cn(
                                                "flex items-center gap-2.5 flex-1 min-w-0 rounded-l-lg border-y border-l px-3 py-2.5 text-sm transition-all text-left",
                                                isLeader
                                                    ? "border-blue-500 dark:border-blue-500/40 bg-primary/8 text-foreground"
                                                    : isSelected
                                                        ? "border-primary bg-primary/8 text-foreground"
                                                        : "border-border bg-background hover:border-primary/50 hover:bg-muted/50 text-muted-foreground"
                                            )}
                                        >
                                            <MemberAvatar name={member.name} memberId={member.$id} className="size-6 shrink-0" />
                                            <span className="truncate flex-1 font-medium">{member.name}</span>
                                            {isMe && !isSelected && (
                                                <span className="text-xs text-muted-foreground shrink-0">{t('squad-you-label')}</span>
                                            )}
                                            {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!isSelected) {
                                                    setSelectedMemberIds(prev => [...prev, member.$id]);
                                                }
                                                setLeadMemberId(member.$id);
                                            }}
                                            title={t('squad-set-as-leader')}
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

                <div className="rounded-lg border bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-2.5">
                        {effectiveLeaderMember && (
                            <MemberAvatar name={effectiveLeaderMember.name} memberId={effectiveLeaderMember.$id} className="size-6 shrink-0" />
                        )}
                        <p className="text-sm text-muted-foreground">
                            {isCreatorLeader
                                ? t('squad-you-are-leader')
                                : `${effectiveLeaderMember?.name} ${t('squad-will-lead')}`
                            }
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        {t('cancel')}
                    </Button>
                    <Button onClick={() => setStep(2)} disabled={!canContinue}>
                        {t('squad-continue')}
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
                <h2 className="font-semibold text-lg">{t('squad-step2-title')}</h2>
            </div>

            <div className="space-y-2.5">
                <Label>{t('squad-pick-color')}</Label>
                <div className="flex flex-wrap gap-2.5">
                    {SQUAD_COLORS.map(color => (
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
                <Label>{t('squad-pick-icon')}</Label>
                <div className="grid grid-cols-7 gap-2">
                    {SQUAD_ICONS.map(({ id, icon: IconComp }) => (
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

            <p className="text-xs text-muted-foreground text-center pt-1">{t('squad-customize-optional')}</p>

            <div className="flex justify-end">
                <Button onClick={handleCreate} disabled={isSubmitting}>
                    {t('create')}
                </Button>
            </div>
        </div>
    );
};

export default CreateSquadFlow;
