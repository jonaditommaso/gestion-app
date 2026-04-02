'use client';

import { useState } from "react";
import { PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useUpdateNote } from "../../api/use-update-note";
import { BellOff, Save } from "lucide-react";

interface NoteReminderPickerProps {
    noteId: string;
    reminderAt?: string | null;
    onClose: () => void;
}

const toLocalDatetimeString = (iso: string | null | undefined): string => {
    if (!iso) return '';
    const date = new Date(iso);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const NoteReminderPicker = ({ noteId, reminderAt, onClose }: NoteReminderPickerProps) => {
    const t = useTranslations('home');
    const { mutate: updateNote, isPending } = useUpdateNote();
    const [value, setValue] = useState(toLocalDatetimeString(reminderAt));

    const handleSave = () => {
        if (!value) return;
        updateNote({
            param: { noteId },
            json: {
                reminderAt: new Date(value).toISOString(),
                reminderNotified: false,
            }
        });
        onClose();
    };

    const handleRemove = () => {
        updateNote({
            param: { noteId },
            json: { reminderAt: null }
        });
        onClose();
    };

    return (
        <PopoverContent className="w-72 p-4" align="end" onClick={e => e.stopPropagation()}>
            <div className="space-y-3">
                <p className="text-sm font-medium">{t('set-reminder')}</p>
                <input
                    type="datetime-local"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    className="w-full border border-input rounded-md px-3 py-1.5 text-sm bg-background text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={!value || isPending}
                        className="flex-1"
                    >
                        <Save className="h-3.5 w-3.5 mr-1.5" />
                        {t('save-reminder')}
                    </Button>
                    {reminderAt && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRemove}
                            disabled={isPending}
                            title={t('remove-reminder')}
                        >
                            <BellOff className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </div>
        </PopoverContent>
    );
};

export default NoteReminderPicker;
