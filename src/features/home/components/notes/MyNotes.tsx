'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Plus, Settings } from "lucide-react";
import Note from './Note';
import { useEffect, useState } from "react";
import { useGetNotes } from "../../api/use-get-notes";
import FadeLoader from "react-spinners/FadeLoader";
import { useCreateNote } from "../../api/use-create-note";
import { useTranslations } from "next-intl";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import dynamic from "next/dynamic";
import EditNoteModal from "./EditNoteModal";
import { useUpdateNote } from "../../api/use-update-note";
import { useDeleteNote } from "../../api/use-delete-note";
import { AnimatePresence } from "motion/react";
import { NoteData } from "../../types";
import { Separator } from "@/components/ui/separator";
import NoteSettingsModal from "./NoteSettingsModal";
import { useGetHomeConfig } from "../../api/use-get-home-config";
import { useCreateHomeConfig } from "../../api/use-create-home-config";
import { useUpdateHomeConfig } from "../../api/use-update-home-config";
import { DEFAULT_NOTES_SETTINGS, GlobalNoteViewId, HomeConfigOverrides } from "../customization/types";

const ColorNoteSelector = dynamic(() => import('./ColorNoteSelector'))

const INITIAL_STATE_NOTE = {
    title: '',
    content: '',
    bgColor: 'none',
    isModern: false,
    hasLines: false,
}

const NOTE_VIEW_IDS: GlobalNoteViewId[] = [
    'home',
    'activities',
    'records',
    'billing',
    'team',
    'roles',
    'settings',
    'meets',
];

const MyNotes = () => {
    const { data, isPending } = useGetNotes();
    const { data: homeConfig } = useGetHomeConfig();
    const { mutate: createNote, isPending: isCreatingNote } = useCreateNote();
    const { mutate: updateNote } = useUpdateNote();
    const { mutate: deleteNote } = useDeleteNote();
    const { mutate: createHomeConfig, isPending: isCreatingHomeConfig } = useCreateHomeConfig();
    const { mutate: updateHomeConfig, isPending: isUpdatingHomeConfig } = useUpdateHomeConfig();

    const [newNote, setNewNote] = useState(INITIAL_STATE_NOTE);
    const [popoverIsOpen, setPopoverIsOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<NoteData | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const t = useTranslations('home')

    let parsedOverrides: HomeConfigOverrides = {};
    if (homeConfig?.widgets) {
        try {
            const parsed = JSON.parse(homeConfig.widgets) as unknown;
            if (parsed && typeof parsed === 'object') {
                parsedOverrides = parsed as HomeConfigOverrides;
            }
        } catch {
            parsedOverrides = {};
        }
    }

    const parsedHiddenViews = parsedOverrides.notesSettings?.hiddenGlobalNoteViews;
    const safeHiddenViews = Array.isArray(parsedHiddenViews)
        ? parsedHiddenViews.filter((view): view is GlobalNoteViewId => NOTE_VIEW_IDS.includes(view as GlobalNoteViewId))
        : DEFAULT_NOTES_SETTINGS.hiddenGlobalNoteViews;

    const defaultNewNoteModern = parsedOverrides.notesSettings?.defaultNewNoteModern ?? DEFAULT_NOTES_SETTINGS.defaultNewNoteModern;
    const defaultNewNoteLines = parsedOverrides.notesSettings?.defaultNewNoteLines ?? DEFAULT_NOTES_SETTINGS.defaultNewNoteLines;

    const hiddenGlobalViews = safeHiddenViews;

    useEffect(() => {
        setNewNote(prev => ({
            ...prev,
            isModern: defaultNewNoteModern,
            hasLines: defaultNewNoteLines,
        }));
    }, [defaultNewNoteModern, defaultNewNoteLines]);

    const isSavingSettings = isCreatingHomeConfig || isUpdatingHomeConfig;

    const filteredNotes = data?.documents.filter(note => !note.isGlobal) || [];

    const pinnedNotes = filteredNotes
        .filter(note => note.isPinned)
        .sort((a, b) => {
            if (a.pinnedAt && b.pinnedAt) {
                return new Date(b.pinnedAt).getTime() - new Date(a.pinnedAt).getTime();
            }
            return 0;
        });

    const unpinnedNotes = filteredNotes.filter(note => !note.isPinned);

    const onChange = (value: string, field: 'title' | 'content' | 'bgColor') => {
        setNewNote(prev => {
            return {
                ...prev,
                [field]: value
            }
        });
        if (field === 'bgColor') setPopoverIsOpen(prev => !prev)
    }

    const handleCreateNote = () => {
        createNote({ json: newNote });
        setNewNote({
            ...INITIAL_STATE_NOTE,
            isModern: defaultNewNoteModern,
            hasLines: defaultNewNoteLines,
        })
    }

    const handleUpdateColor = (id: string, color: string) => {
        updateNote({
            param: { noteId: id },
            json: {
                bgColor: color
            }
        });
    }

    const handleSaveSettings = (payload: {
        hiddenGlobalViews: GlobalNoteViewId[];
        isModernForNewNote: boolean;
        hasLinesForNewNote: boolean;
    }) => {
        setNewNote(prev => ({
            ...prev,
            isModern: payload.isModernForNewNote,
            hasLines: payload.hasLinesForNewNote,
        }));

        const configPayload = {
            widgets: JSON.stringify({
                ...parsedOverrides,
                notesSettings: {
                    hiddenGlobalNoteViews: payload.hiddenGlobalViews,
                    defaultNewNoteModern: payload.isModernForNewNote,
                    defaultNewNoteLines: payload.hasLinesForNewNote,
                },
            })
        };

        if (homeConfig?.$id) {
            updateHomeConfig({ json: configPayload });
            return;
        }

        createHomeConfig({ json: configPayload });
    }

    return (
        <Card className="col-span-1 row-span-2 flex flex-col justify-start items-center bg-sidebar-accent">
            <CardTitle className="p-4">{t('my-notes')}</CardTitle>
            <CardContent className="flex flex-col gap-y-4 w-full mt-2">
                {isPending ? (
                        <div className="w-full flex justify-center">
                            <FadeLoader color="#999" width={3} className="mt-5" />
                        </div>
                    ) : (
                    <>
                        <div className="flex flex-col gap-2">
                            <Input
                                placeholder={t('title')}
                                className="bg-sidebar"
                                value={newNote.title}
                                onChange={(e) => onChange(e.target.value, 'title')}
                            />
                            <div className="relative">
                                <Textarea
                                    placeholder={t('remember-placeholder')}
                                    maxLength={256}
                                    className="resize-none h-40 bg-sidebar"
                                    value={newNote.content}
                                    onChange={(e) => onChange(e.target.value, 'content')}
                                />
                                <div className="absolute bottom-1.5 right-2 text-xs text-muted-foreground pointer-events-none">
                                    {newNote.content.length}/256
                                </div>
                            </div>
                            <div className="flex justify-end items-center gap-2">
                                <div
                                    className="text-muted-foreground cursor-pointer hover:bg-sidebar transition-all duration-100 rounded-full p-2"
                                    onClick={() => setIsSettingsOpen(true)}
                                    title={t('notes-settings-title')}
                                >
                                    <Settings className="w-6 h-6" size={24}/>
                                </div>
                                <Popover open={popoverIsOpen} onOpenChange={() => setPopoverIsOpen(prev => !prev)} >
                                    <PopoverTrigger asChild>
                                        {newNote.bgColor !== 'none' ? (
                                            <div className="cursor-pointer hover:bg-sidebar transition-all duration-100 p-2 w-10 h-10 rounded-full flex items-center justify-center">
                                                <div className={`w-full h-full rounded-full border border-muted-foreground/20 ${newNote.bgColor}`} />
                                            </div>
                                        ) : (
                                            <Palette className="text-muted-foreground cursor-pointer hover:bg-sidebar transition-all duration-100 p-2 w-10 h-10 rounded-full" size={24}/>
                                        )}
                                    </PopoverTrigger>
                                    <ColorNoteSelector onChange={onChange} />
                                </Popover>
                                <Button onClick={handleCreateNote} disabled={isCreatingNote || (!newNote.content && !newNote.title)}>
                                    <Plus /> {t('add-note')}
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            {pinnedNotes.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 justify-center">
                                    <AnimatePresence>
                                        {pinnedNotes.map(note => (
                                            <Note
                                                key={note.$id}
                                                note={note as NoteData}
                                                onEdit={setSelectedNote}
                                                onDelete={(id) => deleteNote({ param: { noteId: id } })}
                                                onUpdateColor={handleUpdateColor}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                            {pinnedNotes.length > 0 && unpinnedNotes.length > 0 && (
                                <Separator />
                            )}
                            {unpinnedNotes.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 justify-center">
                                    <AnimatePresence>
                                        {unpinnedNotes.map(note => (
                                            <Note
                                                key={note.$id}
                                                note={note as NoteData}
                                                onEdit={setSelectedNote}
                                                onDelete={(id) => deleteNote({ param: { noteId: id } })}
                                                onUpdateColor={handleUpdateColor}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </>
                )
            }
            </CardContent>

            {selectedNote && (
                <EditNoteModal
                    note={selectedNote}
                    isOpen={!!selectedNote}
                    onClose={() => setSelectedNote(null)}
                />
            )}

            <NoteSettingsModal
                isOpen={isSettingsOpen}
                setIsOpen={setIsSettingsOpen}
                hiddenGlobalViews={hiddenGlobalViews}
                isModernForNewNote={defaultNewNoteModern}
                hasLinesForNewNote={defaultNewNoteLines}
                isSaving={isSavingSettings}
                onSave={handleSaveSettings}
            />
        </Card>
    );
}

export default MyNotes;