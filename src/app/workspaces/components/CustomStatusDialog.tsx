'use client'
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { CustomStatus } from "../types/custom-status";
import { CUSTOM_STATUS_ICON_OPTIONS, CUSTOM_STATUS_COLOR_OPTIONS } from "../constants/custom-status-options";
import { TaskStatus } from "@/features/tasks/types";

interface CustomStatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaveStatus: (status: Omit<CustomStatus, 'id' | 'isDefault' | 'position'>) => void;
    existingStatusCount: number;
    /** If provided, the dialog will be in edit mode */
    editingStatus?: CustomStatus;
}

export const CustomStatusDialog = ({
    open,
    onOpenChange,
    onSaveStatus,
    editingStatus,
}: CustomStatusDialogProps) => {
    const t = useTranslations('workspaces');
    const [label, setLabel] = useState('');
    const [color, setColor] = useState('#3b82f6');
    const [icon, setIcon] = useState<CustomStatus['icon']>('circle');
    const inputRef = useRef<HTMLInputElement>(null);

    const isEditMode = !!editingStatus;

    // Translation keys for default statuses
    const statusTranslationKey: Record<string, string> = {
        [TaskStatus.BACKLOG]: 'backlog',
        [TaskStatus.TODO]: 'todo',
        [TaskStatus.IN_PROGRESS]: 'in-progress',
        [TaskStatus.IN_REVIEW]: 'in-review',
        [TaskStatus.DONE]: 'done',
    };

    // Get the translated label for default statuses
    const getTranslatedLabel = (status: CustomStatus): string => {
        if (status.isDefault && statusTranslationKey[status.id]) {
            return t(statusTranslationKey[status.id]);
        }
        return status.label;
    };

    // Populate form when editing
    useEffect(() => {
        if (editingStatus) {
            setLabel(getTranslatedLabel(editingStatus));
            setColor(editingStatus.color);
            setIcon(editingStatus.icon);
        } else {
            // Reset form for create mode
            setLabel('');
            setColor('#3b82f6');
            setIcon('circle');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingStatus, open]);

    // Move cursor to end of input when dialog opens in edit mode
    useEffect(() => {
        if (open && isEditMode && inputRef.current) {
            // Longer delay to ensure the dialog animation completes and input is ready
            const timer = setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    const length = inputRef.current.value.length;
                    inputRef.current.setSelectionRange(length, length);
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [open, isEditMode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!label.trim()) return;

        onSaveStatus({
            label: label.trim(),
            color,
            icon,
            limitType: editingStatus?.limitType ?? 'no',
            limitMax: editingStatus?.limitMax ?? null,
            protected: editingStatus?.protected ?? false,
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
            <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{isEditMode ? t('edit-column') : t('create-custom-status')}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? t('edit-column-description') : t('create-custom-status-description')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="label">{t('status-name')}</Label>
                        <Input
                            ref={inputRef}
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
                            {isEditMode ? t('save') : t('create-status')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
