'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { CustomStatus } from "../types/custom-status";
import { CUSTOM_STATUS_ICON_OPTIONS, CUSTOM_STATUS_COLOR_OPTIONS } from "../constants/custom-status-options";

interface CreateCustomStatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateStatus: (status: Omit<CustomStatus, 'id' | 'isDefault' | 'position'>) => void;
    existingStatusCount: number;
}

export const CreateCustomStatusDialog = ({
    open,
    onOpenChange,
    onCreateStatus,
}: CreateCustomStatusDialogProps) => {
    const t = useTranslations('workspaces');
    const [label, setLabel] = useState('');
    const [color, setColor] = useState('#3b82f6');
    const [icon, setIcon] = useState<CustomStatus['icon']>('circle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!label.trim()) return;

        onCreateStatus({
            label: label.trim(),
            color,
            icon,
            limitType: 'no',
            limitMax: null,
            protected: false,
        });

        // Reset form
        setLabel('');
        setColor('#3b82f6');
        setIcon('circle');
        onOpenChange(false);
    };

    const selectedIconOption = CUSTOM_STATUS_ICON_OPTIONS.find(opt => opt.value === icon);
    const SelectedIcon = selectedIconOption?.icon || CUSTOM_STATUS_ICON_OPTIONS[0].icon;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('create-custom-status')}</DialogTitle>
                    <DialogDescription>
                        {t('create-custom-status-description')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="label">{t('status-name')}</Label>
                        <Input
                            id="label"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder={t('enter-status-name')}
                            maxLength={25}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="icon">{t('icon')}</Label>
                        <Select value={icon} onValueChange={(value) => setIcon(value as CustomStatus['icon'])}>
                            <SelectTrigger id="icon">
                                <SelectValue>
                                    <div className="flex items-center gap-2">
                                        <SelectedIcon className="size-4" style={{ color }} />
                                        {selectedIconOption?.label}
                                    </div>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {CUSTOM_STATUS_ICON_OPTIONS.map((option) => {
                                    const IconComponent = option.icon;
                                    return (
                                        <SelectItem key={option.value} value={option.value}>
                                            <div className="flex items-center gap-2">
                                                <IconComponent className="size-4" style={{ color }} />
                                                {option.label}
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="color">{t('color')}</Label>
                        <Select value={color} onValueChange={setColor}>
                            <SelectTrigger id="color">
                                <SelectValue>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="size-4 rounded-full"
                                            style={{ backgroundColor: color }}
                                        />
                                        {CUSTOM_STATUS_COLOR_OPTIONS.find(c => c.value === color)?.label}
                                    </div>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {CUSTOM_STATUS_COLOR_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="size-4 rounded-full"
                                                style={{ backgroundColor: option.value }}
                                            />
                                            {option.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            {t('cancel')}
                        </Button>
                        <Button type="submit" disabled={!label.trim()}>
                            {t('create-status')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
