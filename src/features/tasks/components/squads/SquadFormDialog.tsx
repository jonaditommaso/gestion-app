'use client'
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import { useCreateSquad } from "../../api/squads/use-create-squad";
import { useUpdateSquad } from "../../api/squads/use-update-squad";
import { TaskSquad, WorkspaceMember } from "../../types";

interface SquadFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string;
    availableMembers: WorkspaceMember[];
    squad?: TaskSquad;
}

const SquadFormDialog = ({ open, onOpenChange, workspaceId, availableMembers, squad }: SquadFormDialogProps) => {
    const t = useTranslations('workspaces');
    const isEdit = !!squad;

    const [name, setName] = useState(squad?.name ?? '');
    const [leadMemberId, setLeadMemberId] = useState<string>(squad?.leadMemberId ?? '');

    useEffect(() => {
        if (open) {
            setName(squad?.name ?? '');
            setLeadMemberId(squad?.leadMemberId ?? '');
        }
    }, [open, squad]);

    const { mutate: createSquad, isPending: isCreating } = useCreateSquad();
    const { mutate: updateSquad, isPending: isUpdating } = useUpdateSquad(workspaceId);
    const isPending = isCreating || isUpdating;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (isEdit) {
            updateSquad({
                param: { squadId: squad.$id },
                json: {
                    name: name.trim(),
                    leadMemberId: leadMemberId || null,
                }
            }, {
                onSuccess: () => onOpenChange(false),
            });
        } else {
            createSquad({
                json: {
                    name: name.trim(),
                    workspaceId,
                    leadMemberId: leadMemberId || null,
                }
            }, {
                onSuccess: () => onOpenChange(false),
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? t('edit-squad') : t('create-squad')}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="squad-name">{t('squad-name')}</Label>
                        <Input
                            id="squad-name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder={t('squad-name-placeholder')}
                            disabled={isPending}
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('squad-lead')}</Label>
                        <Select
                            value={leadMemberId || 'none'}
                            onValueChange={val => setLeadMemberId(val === 'none' ? '' : val)}
                            disabled={isPending}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('squad-no-lead')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">{t('squad-no-lead')}</SelectItem>
                                {availableMembers.map(m => (
                                    <SelectItem key={m.$id} value={m.$id}>
                                        <div className="flex items-center gap-2">
                                            <MemberAvatar name={m.name} memberId={m.$id} className="size-5" />
                                            {m.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            {t('cancel')}
                        </Button>
                        <Button type="submit" disabled={isPending || !name.trim()}>
                            {isEdit ? t('save') : t('create')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SquadFormDialog;
