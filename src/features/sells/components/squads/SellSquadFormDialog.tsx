'use client'
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MemberAvatar from "@/features/members/components/MemberAvatar";
import { useUpdateSellSquad } from "../../api/use-update-sell-squad";
import { SellSquad, Seller } from "../../types";

interface SellSquadFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    squad: SellSquad;
}

const SellSquadFormDialog = ({ open, onOpenChange, squad }: SellSquadFormDialogProps) => {
    const t = useTranslations("sales");
    const [name, setName] = useState(squad.name);
    const [leadSellerId, setLeadSellerId] = useState<string>(squad.leadSellerId ?? '');

    useEffect(() => {
        if (open) {
            setName(squad.name);
            setLeadSellerId(squad.leadSellerId ?? '');
        }
    }, [open, squad]);

    const { mutate: updateSquad, isPending } = useUpdateSellSquad();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        updateSquad({
            param: { squadId: squad.$id },
            json: {
                name: name.trim(),
                leadSellerId: leadSellerId || null,
            },
        }, {
            onSuccess: () => onOpenChange(false),
        });
    };

    const members: Seller[] = squad.members ?? [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("squads.edit-squad")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="sell-squad-edit-name">{t("squads.squad-name")}</Label>
                        <Input
                            id="sell-squad-edit-name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder={t("squads.squad-name-placeholder")}
                            disabled={isPending}
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t("squads.squad-lead")}</Label>
                        <Select
                            value={leadSellerId || 'none'}
                            onValueChange={val => setLeadSellerId(val === 'none' ? '' : val)}
                            disabled={isPending}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t("squads.squad-no-lead")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">{t("squads.squad-no-lead")}</SelectItem>
                                {members.map(seller => (
                                    <SelectItem key={seller.id} value={seller.id}>
                                        <div className="flex items-center gap-2">
                                            <MemberAvatar name={seller.name} memberId={seller.memberId} className="size-5" />
                                            {seller.name}
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
                            {t("squads.cancel")}
                        </Button>
                        <Button type="submit" disabled={isPending || !name.trim()}>
                            {t("squads.save")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SellSquadFormDialog;
