'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Settings, StickyNote } from "lucide-react";
import Note from './Note';
import { useState } from "react";
import { useGetNotes } from "../../api/use-get-notes";
import { useTranslations } from "next-intl";
import EditNoteModal from "./EditNoteModal";
import { useUpdateNote } from "../../api/use-update-note";
import { useDeleteNote } from "../../api/use-delete-note";
import { useCreateNote } from "../../api/use-create-note";
import { AnimatePresence } from "motion/react";
import { NoteData } from "../../types";
import { Separator } from "@/components/ui/separator";
import NoteSettingsModal from "./NoteSettingsModal";
import { useGetHomeConfig } from "../../api/use-get-home-config";
import { useCreateHomeConfig } from "../../api/use-create-home-config";
import { useUpdateHomeConfig } from "../../api/use-update-home-config";
import { DEFAULT_NOTES_SETTINGS, GlobalNoteViewId, HomeConfigOverrides } from "../customization/types";
import CreateNoteModal from "./CreateNoteModal";

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

const ONBOARDING_NOTE_ID = '__onboarding__';
const ONBOARDING_COLORS = ['bg-[#5075bf]', 'bg-[#4cb592]', 'bg-[#f0a256]', 'bg-[#a668c4]', 'bg-[#de5281]'];

const MyNotes = () => {
    const { data, isPending } = useGetNotes();
    const { data: homeConfig } = useGetHomeConfig();
    const { mutate: updateNote } = useUpdateNote();
    const { mutate: deleteNote } = useDeleteNote();
    const { mutate: createNote } = useCreateNote();
    const { mutate: createHomeConfig, isPending: isCreatingHomeConfig } = useCreateHomeConfig();
    const { mutate: updateHomeConfig, isPending: isUpdatingHomeConfig } = useUpdateHomeConfig();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<NoteData | null>(null);
    const [isOnboardingEdit, setIsOnboardingEdit] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [onboardingColor] = useState(
        () => ONBOARDING_COLORS[Math.floor(Math.random() * ONBOARDING_COLORS.length)]
    );

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

    const isSavingSettings = isCreatingHomeConfig || isUpdatingHomeConfig;

    const filteredNotes = data?.documents.filter(note => !note.isGlobal) || [];

    const noteOnboardingDone = parsedOverrides.noteOnboardingDone === true;
    const showOnboardingNote = !isPending && data !== undefined && filteredNotes.length === 0 && !noteOnboardingDone;

    const onboardingNote: NoteData = {
        $id: ONBOARDING_NOTE_ID,
        title: t('note-onboarding-title'),
        content: t('note-onboarding-content'),
        bgColor: onboardingColor,
        isModern: true,
        hasLines: true,
        isPinned: false,
        isGlobal: false,
        userId: '',
        $collectionId: '',
        $databaseId: '',
        $createdAt: '',
        $updatedAt: '',
        $permissions: [],
    };

    const handleMarkOnboardingDone = () => {
        const configPayload = {
            widgets: JSON.stringify({
                ...parsedOverrides,
                noteOnboardingDone: true,
            })
        };
        if (homeConfig?.$id) {
            updateHomeConfig({ json: configPayload });
        } else {
            createHomeConfig({ json: configPayload });
        }
    };

    const handleEditNote = (note: NoteData) => {
        if (note.$id === ONBOARDING_NOTE_ID) {
            setIsOnboardingEdit(true);
        } else {
            setIsOnboardingEdit(false);
        }
        setSelectedNote(note);
    };

    const pinnedNotes = filteredNotes
        .filter(note => note.isPinned)
        .sort((a, b) => {
            if (a.pinnedAt && b.pinnedAt) {
                return new Date(b.pinnedAt).getTime() - new Date(a.pinnedAt).getTime();
            }
            return 0;
        });

    const unpinnedNotes = filteredNotes.filter(note => !note.isPinned);

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
        <Card className="col-span-1 row-span-2 flex flex-col justify-start items-center max-h-[550px] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between w-full">
                <CardTitle className="flex items-center gap-2 text-sm">
                    <StickyNote className="h-5 w-5 text-indigo-500" />
                    {t('my-notes')}
                </CardTitle>
                <div className="flex items-center gap-2 !m-0">
                    <div
                        className="text-muted-foreground cursor-pointer hover:bg-sidebar transition-all duration-100 rounded-full p-2"
                        onClick={() => setIsSettingsOpen(true)}
                        title={t('notes-settings-title')}
                    >
                        <Settings className="w-5 h-5" size={24}/>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus /> {t('add-note')}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-y-4 w-full mt-2 overflow-y-auto">
                {/* {isPending ? (
                        <div className="w-full flex justify-center">
                            <FadeLoader color="#999" width={3} className="mt-5" />
                        </div>
                    ) : ( */}
                    <>
                        {/* <div className="flex items-center justify-between w-full px-2">
                            <div className="text-lg font-semibold">{t('my-notes')}</div>
                        </div> */}
                        {/* <Separator /> */}
                        <div className="flex flex-col gap-4">
                            {showOnboardingNote && (
                                <div className="grid grid-cols-2 gap-2 justify-center">
                                    <AnimatePresence>
                                        <Note
                                            key={ONBOARDING_NOTE_ID}
                                            note={onboardingNote}
                                            onEdit={handleEditNote}
                                            onDelete={handleMarkOnboardingDone}
                                            onUpdateColor={() => {}}
                                            hideReminder
                                        />
                                    </AnimatePresence>
                                </div>
                            )}
                            {pinnedNotes.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 justify-center">
                                    <AnimatePresence>
                                        {pinnedNotes.map(note => (
                                            <Note
                                                key={note.$id}
                                                note={note as NoteData}
                                                onEdit={handleEditNote}
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
                                                onEdit={handleEditNote}
                                                onDelete={(id) => deleteNote({ param: { noteId: id } })}
                                                onUpdateColor={handleUpdateColor}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </>
                {/* )
            } */}
            </CardContent>

            {selectedNote && (
                <EditNoteModal
                    note={selectedNote}
                    isOpen={!!selectedNote}
                    onClose={() => { setSelectedNote(null); setIsOnboardingEdit(false); }}
                    isOnboarding={isOnboardingEdit}
                    onSaveAsNew={(data) => createNote({ json: data })}
                    onDismiss={handleMarkOnboardingDone}
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

            <CreateNoteModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                defaultIsModern={defaultNewNoteModern}
                defaultHasLines={defaultNewNoteLines}
            />
        </Card>
    );
}

export default MyNotes;