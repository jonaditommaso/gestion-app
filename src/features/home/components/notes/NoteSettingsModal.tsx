'use client'

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { DialogContainer } from "@/components/DialogContainer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { GlobalNoteViewId } from "../customization/types";
import { useTranslations } from "next-intl";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface NoteSettingsModalProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    hiddenGlobalViews: GlobalNoteViewId[];
    isModernForNewNote: boolean;
    hasLinesForNewNote: boolean;
    isSaving: boolean;
    onSave: (payload: {
        hiddenGlobalViews: GlobalNoteViewId[];
        isModernForNewNote: boolean;
        hasLinesForNewNote: boolean;
    }) => void;
}

const VIEWS: GlobalNoteViewId[] = [
    'home',
    'billing',
    'records',
    'activities',
    'team',
    'roles',
    'settings',
    // 'meets',
];

const NoteSettingsModal = ({
    isOpen,
    setIsOpen,
    hiddenGlobalViews,
    isModernForNewNote,
    hasLinesForNewNote,
    isSaving,
    onSave,
}: NoteSettingsModalProps) => {
    const t = useTranslations('home');

    const [hiddenViewsState, setHiddenViewsState] = useState<GlobalNoteViewId[]>(hiddenGlobalViews);
    const [isModernState, setIsModernState] = useState<boolean>(isModernForNewNote);
    const [hasLinesState, setHasLinesState] = useState<boolean>(hasLinesForNewNote);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setHiddenViewsState(hiddenGlobalViews);
        setIsModernState(isModernForNewNote);
        setHasLinesState(hasLinesForNewNote);
    }, [isOpen, hiddenGlobalViews, isModernForNewNote, hasLinesForNewNote]);

    const handleToggleView = (viewId: GlobalNoteViewId, checked: boolean) => {
        setHiddenViewsState(prev => {
            if (checked) {
                return prev.filter(item => item !== viewId);
            }

            if (prev.includes(viewId)) {
                return prev;
            }

            return [...prev, viewId];
        });
    };

    const handleSave = () => {
        onSave({
            hiddenGlobalViews: hiddenViewsState,
            isModernForNewNote: isModernState,
            hasLinesForNewNote: hasLinesState,
        });
        setIsOpen(false);
    };

    const allViewsSelected = hiddenViewsState.length === 0;

    return (
        <DialogContainer
            title={t('notes-settings-title')}
            description={t('notes-settings-description')}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <p className="text-sm font-medium">{t('notes-settings-global-visibility')}</p>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                {allViewsSelected
                                    ? t('notes-settings-all-views')
                                    : t('notes-settings-custom-views')}
                                <ChevronDown className="h-4 w-4 opacity-60" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] p-2">
                            {VIEWS.map(viewId => {
                                const checked = !hiddenViewsState.includes(viewId);
                                const id = `global-view-${viewId}`;

                                return (
                                    <div
                                        key={viewId}
                                        className="flex items-center gap-2 py-1.5 px-1 rounded-sm hover:bg-accent"
                                    >
                                        <Checkbox
                                            id={id}
                                            checked={checked}
                                            onCheckedChange={(value) => handleToggleView(viewId, value === true)}
                                        />
                                        <label htmlFor={id} className="text-sm cursor-pointer w-full">
                                            {t(`notes-view-${viewId}`)}
                                        </label>
                                    </div>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="!mt-8">
                    <p className="text-sm font-medium">{t('notes-settings-new-note-appearance')}</p>
                </div>

                <div className="flex items-center justify-between rounded-md border bg-sidebar p-3">
                    <div>
                        <p className="text-sm font-medium">{t('notes-style-pro')}</p>
                        <p className="text-xs text-muted-foreground">{t('notes-settings-modern-description')}</p>
                    </div>
                    <Switch checked={isModernState} onCheckedChange={setIsModernState} />
                </div>

                <div className="flex items-center justify-between rounded-md border bg-sidebar p-3">
                    <div>
                        <p className="text-sm font-medium">{t('notes-settings-lines')}</p>
                        <p className="text-xs text-muted-foreground">{t('notes-settings-lines-description')}</p>
                    </div>
                    <Switch checked={hasLinesState} onCheckedChange={setHasLinesState} />
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pb-4">
                <Button variant="secondary" onClick={() => setIsOpen(false)}>
                    {t('cancel')}
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    {t('save')}
                </Button>
            </div>
        </DialogContainer>
    );
}

export default NoteSettingsModal;
